import {Component, OnInit} from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  historialPostulaciones: any[] = [];
  historialFiltrado: any[] = [];
  cargos: string[] = []; // Lista de cargos disponibles
  selectedCargo: string = ''; // Cargo seleccionado para filtrar
  convocatorias: any[] = [];
  selectedConvocatoria: string = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    /*this.cargarHistorial();*/
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

  cargarHistorial(): void {
    if (!this.selectedConvocatoria) {
      this.historialFiltrado = [];
      this.cargos = []; // Limpiar cargos cuando no hay convocatoria seleccionada
      return;
    }

    this.firebaseService.obtenerHistorial().subscribe(historial => {
      // Filtrar por convocatoria
      this.historialPostulaciones = historial.filter(entry => entry.convocatoria === this.selectedConvocatoria);

      // Extraer cargos únicos para la convocatoria seleccionada
      this.cargos = [...new Set(this.historialPostulaciones.map(entry => entry.cargo))];

      // Filtrar por cargo seleccionado si ya hay uno
      this.filtrarHistorial();
    });
  }

  filtrarHistorial(): void {
    if (!this.selectedConvocatoria || !this.selectedCargo) {
      this.historialFiltrado = [];
      return;
    }

    // Filtrar historial por convocatoria y cargo
    this.historialFiltrado = this.historialPostulaciones.filter(entry => entry.cargo === this.selectedCargo);
  }


  selectedPostulante: any = null; // Para el popup modal

  verDetalles(postulante: any): void {
    console.log("Postulante seleccionado:", postulante); // Debug: Ver si la función se ejecuta
    this.selectedPostulante = postulante;
  }

  cerrarPopup(): void {
    this.selectedPostulante = null;
  }

  mostrarModalConvocatoria = false;
  nuevaConvocatoria = { nombre: '', fechaInicio: '', fechaFin: '' };

  abrirModalConvocatoria(): void {
    this.mostrarModalConvocatoria = true;
  }

  cerrarModalConvocatoria(): void {
    this.mostrarModalConvocatoria = false;
    this.nuevaConvocatoria = { nombre: '', fechaInicio: '', fechaFin: '' }; // Reiniciar valores
  }

  guardarConvocatoria(): void {
    if (!this.nuevaConvocatoria.nombre || !this.nuevaConvocatoria.fechaInicio || !this.nuevaConvocatoria.fechaFin) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    this.firebaseService.guardarConvocatoria(this.nuevaConvocatoria).then(() => {
      alert('Convocatoria guardada con éxito.');
      this.cerrarModalConvocatoria();
    }).catch(error => {
      console.error('Error al guardar la convocatoria:', error);
    });
  }



}
