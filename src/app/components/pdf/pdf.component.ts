import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent {
  selectedFile: File | null = null;
  responseData: any = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  // Manejar la selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];

      // Validar si es un archivo PDF
      if (this.selectedFile.type !== 'application/pdf') {
        alert('Por favor selecciona un archivo PDF.');
        this.selectedFile = null;
      }
    }
  }

  // Enviar el archivo al servidor
  onSubmit(): void {
    if (!this.selectedFile) {
      alert('Por favor selecciona un archivo antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.isLoading = true;
    this.errorMessage = null;

    // Enviar al endpoint FastAPI
    this.http.post('http://127.0.0.1:8000/upload/', formData).subscribe({
      next: (response) => {
        this.responseData = response;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = `Error al subir el archivo: ${error.message}`;
        console.error('Error:', error);
      }
    });
  }
}
