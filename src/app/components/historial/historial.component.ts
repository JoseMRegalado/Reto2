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

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.firebaseService.obtenerHistorial().subscribe((historial) => {
      this.historialPostulaciones = historial;

      // Extraer los cargos únicos del historial para el filtro
      this.cargos = [...new Set(historial.map(entry => entry.cargo))];

      this.filtrarPorCargo(); // Aplicar el filtro al cargar los datos
    });
  }

  filtrarPorCargo(): void {
    if (!this.selectedCargo) {
      this.historialFiltrado = []; // No mostrar nada hasta que se seleccione un cargo
      return;
    }

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


}
