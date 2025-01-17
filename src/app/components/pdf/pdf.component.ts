import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {
  selectedFile: File | null = null;
  selectedCargo: string | null = null;
  cargos: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.firebaseService.getCargos().subscribe(
      (data) => {
        this.cargos = data;
      },
      (error) => {
        console.error('Error al cargar los cargos:', error);
      }
    );
  }

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

  onSubmit(): void {
    if (!this.selectedFile || !this.selectedCargo) {
      alert('Por favor selecciona un cargo y un archivo antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('cargo', this.selectedCargo);

    this.isLoading = true;
    this.errorMessage = null;

    this.http.post('http://127.0.0.1:8000/upload/', formData).subscribe({
      next: (response) => {
        alert('Archivo subido exitosamente.');
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
