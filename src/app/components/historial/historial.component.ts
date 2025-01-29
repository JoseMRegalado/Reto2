import {Component, OnInit} from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  historialPostulaciones: any[] = [];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.firebaseService.obtenerHistorial().subscribe((historial) => {
      console.log('Historial con postulantes:', historial);
      this.historialPostulaciones = historial;
    });
  }

  verDetalles(historial: any): void {
    console.log('Ver detalles del historial:', historial);
    // Aquí podrías mostrar un popup con detalles o navegar a otra vista.
  }
}
