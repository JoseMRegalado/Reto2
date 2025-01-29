import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { GeminiService } from "../../services/gemini.service";

@Component({
  selector: 'app-gemini',
  templateUrl: './gemini.component.html',
  styleUrls: ['./gemini.component.css']
})
export class GeminiComponent implements OnInit {
  cargos: any[] = [];
  postulantes: any[] = [];
  postulantesFiltrados: any[] = [];
  selectedCargo: string = '';
  selectedPostulante: any = null; // Para el popup modal

  constructor(
    private firebaseService: FirebaseService,
    private geminiService: GeminiService
  ) {}

  ngOnInit(): void {
    this.firebaseService.getCargos().subscribe((cargos) => {
      this.cargos = cargos;
    });

    this.firebaseService.getPostulantes().subscribe((postulantes) => {
      this.postulantes = postulantes;
    });
  }

  filtrarPostulantes(): void {
    if (this.selectedCargo) {
      this.postulantesFiltrados = this.postulantes.filter(
        (postulante) => postulante.CARGO_POSTULA === this.selectedCargo
      );
    } else {
      this.postulantesFiltrados = this.postulantes;
    }
  }

  guardarEvaluacionEnHistorial(): void {
    const evaluacion = {
      fecha: new Date().toISOString(),  // Guarda la fecha actual
      cargo: this.selectedCargo,
      postulantes: this.postulantesFiltrados.map(postulante => ({
        nombre_completo: postulante.nombre_completo,
        puntaje: postulante.puntaje,
        razones: postulante.razones
      }))
    };

    this.firebaseService.guardarEvaluacion(evaluacion)
      .then(() => console.log('Evaluación guardada en historial'))
      .catch(error => console.error('Error guardando evaluación:', error));
  }

  evaluarPostulantes(): void {
    if (!this.selectedCargo || this.postulantesFiltrados.length === 0) {
      console.warn('Debe seleccionar un cargo y tener postulantes para evaluar.');
      return;
    }

    const cargoSeleccionado = this.cargos.find(cargo => cargo.cargo === this.selectedCargo);
    if (!cargoSeleccionado) {
      console.warn('No se encontraron requisitos para el cargo seleccionado.');
      return;
    }

    const context = JSON.stringify({
      "contesta en español": true,
      "formato_json": true,
      "evaluarPostulantes": true,
      "instrucciones": `
      Evalúa los postulantes según los siguientes criterios:
      - Nivel académico: compararlo con el nivel requerido del cargo.
      - Cursos: comparar los cursos con los conocimientos requeridos.
      Devuelve un puntaje sobre 100 y razones específicas para cada postulante en formato JSON:
      {
        'postulantesOrdenados': [
          { 'NOMBRES_Y_APELLIDOS': string, 'puntaje': number, 'razones': string[] }
        ]
      }.
    `,
      postulantesData: this.postulantesFiltrados,
      cargoData: cargoSeleccionado
    });

    this.geminiService.sendPrompt(context).subscribe(
      (response: string) => {
        try {
          const cleanedResponse = response.replace(/```json|```/g, '').trim();
          const ordenados = JSON.parse(cleanedResponse).postulantesOrdenados || [];

          this.postulantesFiltrados = this.postulantesFiltrados.map(postulante => {
            const ordenado = ordenados.find((p: { NOMBRES_Y_APELLIDOS: string }) => p.NOMBRES_Y_APELLIDOS === postulante.nombre_completo);
            return ordenado ? { ...postulante, puntaje: ordenado.puntaje, razones: ordenado.razones } : postulante;
          });

          this.postulantesFiltrados.sort((a, b) => b.puntaje - a.puntaje);
          this.guardarEvaluacionEnHistorial();

        } catch (error) {
          console.error('Error al procesar la respuesta del modelo:', error);
          console.log('Respuesta recibida:', response);
        }
      },
      (error: any) => {
        console.error('Error evaluando postulantes:', error);
      }
    );
  }



  verMas(postulante: any): void {
    this.selectedPostulante = postulante;
  }

  cerrarPopup(): void {
    this.selectedPostulante = null;
  }
}
