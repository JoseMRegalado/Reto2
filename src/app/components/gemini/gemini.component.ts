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
          // Limpia el bloque ```json y otros caracteres extra
          const cleanedResponse = response.replace(/```json|```/g, '').trim();

          // Intenta parsear la respuesta como JSON
          this.postulantesOrdenados = JSON.parse(cleanedResponse).postulantesOrdenados || [];
        } catch (error) {
          console.error('Error al procesar la respuesta del modelo:', error);
          console.log('Respuesta recibida:', response); // Para depuración
          // Si no es JSON, almacena la respuesta como texto plano
          this.postulantesOrdenados = [];
          this.chatHistory.push({ question: this.message, response });
        }
      },
      (error: any) => {
        console.error('Error evaluando postulantes:', error);
        this.postulantesOrdenados = [];
      }
    );

  }
}
