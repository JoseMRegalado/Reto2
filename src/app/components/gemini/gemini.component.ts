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
  convocatorias: any[] = [];
  selectedConvocatoria: string = '';

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

    this.firebaseService.getConvocatorias().subscribe((convocatorias) => {
      this.convocatorias = convocatorias;
    });

  }

  cargarConvocatorias(): void {
    if (this.selectedConvocatoria == '') {
      this.firebaseService.getConvocatorias().subscribe(convocatorias => {
        this.convocatorias = convocatorias;
      });
    }
  }

  filtrarPostulantes(): void {
    this.postulantesFiltrados = this.postulantes.filter(postulante => {
      const cargoCoincide = this.selectedCargo ? postulante.CARGO_POSTULA === this.selectedCargo : true;
      const convocatoriaCoincide = this.selectedConvocatoria ? postulante.CONVOCATORIA === this.selectedConvocatoria : true;
      return cargoCoincide && convocatoriaCoincide;
    });
  }


  guardarEvaluacionEnHistorial(): void {
    const evaluacion = {
      cargo: this.selectedCargo,
      convocatoria:this.selectedConvocatoria,
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
    if (!this.selectedCargo || !this.convocatorias || this.postulantesFiltrados.length === 0) {
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
  Evalúa a los postulantes para el cargo en la institución financiera, comparando sus perfiles con los requisitos del puesto (cargoData).

  La evaluación se basará en los campos de cargoData, que incluyen:
    - Nivel académico comparalo con el area de conocimiento del cargo y calificalo sobre 20 puntos
    - Cursos compara si el contenido del mismo esta alineado con conocimiento técnico y calificalo sobre 25 puntos
    - Experiencia comparalo con los cargos que ha tenido, el actual, ultimo y penultimo, en especial si entre los tiempos
      que ha estado laborando, cumple con los años que piden de experiencia y calificalo sobre 40 puntos
    - Habilidades/Destrezas/Competencias puedes compararlo con contribuciones laborales y calificarlo sobre 15 puntos

  Para cada postulante, asigna un puntaje sobre 100, justificando la calificación con aspectos positivos y negativos encontrados en su perfil.

  Devuelve los resultados en formato JSON:
  {
    'postulantesOrdenados': [
      {
        'NOMBRES_Y_APELLIDOS': string,
        'puntaje': number,
        'razones': {
          'aspectosPositivos': string[],
          'aspectosNegativos': string[]
        }
      }
    ]
  }

  Consideraciones adicionales:
    - Prioriza la precisión en la comparación de perfiles y la justificación de los puntajes.
    - Sé específico al mencionar los aspectos positivos y negativos de cada postulante.
    - Si un postulante no cumple con un requisito esencial, su puntaje debe reflejarlo.
    - Si dos postulantes tienen puntajes similares, asegúrate de que las razones destaquen sus diferencias clave.
` ,
      postulantesData: this.postulantesFiltrados,
      cargoData: cargoSeleccionado
    });

    this.geminiService.sendPrompt(context).subscribe(
      (response: string) => {
        try {
          const cleanedResponse = response.replace(/`json|`/g, '').trim();
          const ordenados = JSON.parse(cleanedResponse).postulantesOrdenados || [];

          this.postulantesFiltrados = this.postulantesFiltrados.map(postulante => {
            const ordenado = ordenados.find((p: { NOMBRES_Y_APELLIDOS: string }) => p.NOMBRES_Y_APELLIDOS === postulante.nombre_completo);
            return ordenado ? { ...postulante, ...ordenado } : postulante; // Fusiona los datos del postulante con los de Gemini
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
