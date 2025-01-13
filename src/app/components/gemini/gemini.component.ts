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

  message: string = '';
  chatHistory: { question: string, response: string }[] = [];
  postulantesOrdenados: any[] = []; // Lista de postulantes ordenados

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
      this.postulantesFiltrados = postulantes; // Inicialmente muestra todos.
    });
  }

  filtrarPostulantes(): void {
    if (this.selectedCargo) {
      this.postulantesFiltrados = this.postulantes.filter(
        (postulante) => postulante.CARGO_POSTULA === this.selectedCargo
      );
    } else {
      this.postulantesFiltrados = this.postulantes; // Si no hay filtro, muestra todos.
    }
  }

  evaluarPostulantes(): void {
    if (!this.selectedCargo || this.postulantesFiltrados.length === 0) {
      console.warn('Debe seleccionar un cargo y tener postulantes para evaluar.');
      return;
    }

    const context = JSON.stringify({
      "contesta en español": true,
      "formato_json": true,
      "evaluarPostulantes": true,
      "instrucciones": "Devuelve una lista ordenada en formato JSON con el siguiente esquema: { 'postulantesOrdenados': [{ 'NOMBRES_Y_APELLIDOS': string, 'puntaje': number }] }.",
      postulantesData: this.postulantesFiltrados,
      cargoData: this.cargos.find(cargo => cargo.CARGO === this.selectedCargo),
    });

    this.geminiService.sendPrompt(context).subscribe(
      (response: string) => {
        try {
          const cleanedResponse = response.replace(/```json|```/g, '').trim();
          const ordenados = JSON.parse(cleanedResponse).postulantesOrdenados || [];

          // Actualizar los puntajes en la tabla
          this.postulantesFiltrados = this.postulantesFiltrados.map(postulante => {
            const ordenado = ordenados.find((p: { NOMBRES_Y_APELLIDOS: any; }) => p.NOMBRES_Y_APELLIDOS === postulante.NOMBRES_Y_APELLIDOS);
            return ordenado ? { ...postulante, puntaje: ordenado.puntaje } : postulante;
          });

          // Ordenar la lista localmente
          this.postulantesFiltrados.sort((a, b) => b.puntaje - a.puntaje);

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

}
