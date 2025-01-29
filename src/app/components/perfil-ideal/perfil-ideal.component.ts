import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-perfil-ideal',
  templateUrl: './perfil-ideal.component.html',
  styleUrls: ['./perfil-ideal.component.css']
})
export class PerfilIdealComponent {
  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  // Función para seleccionar archivo PDF
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      if (this.selectedFile.type !== 'application/pdf') {
        alert('Por favor selecciona un archivo PDF.');
        this.selectedFile = null;
      }
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  // Función para enviar el archivo al backend
  onSubmit(): void {
    if (!this.selectedFile) {
      alert('Por favor selecciona un archivo antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.isLoading = true;
    this.errorMessage = null;

    // Llamada a la API de FastAPI para procesar el PDF
    this.http.post('http://127.0.0.1:8001/procesar-pdf/', formData).subscribe({
      next: (response) => {
        alert('Archivo procesado correctamente.');
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = `Error al procesar el archivo: ${error.message}`;
        console.error('Error:', error);
      }
    });
  }
}
