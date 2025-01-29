import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: AngularFirestore) { }

  getCargos(): Observable<any[]> {
    return this.firestore.collection('cargos').valueChanges();
  }

  getPostulantes(): Observable<any[]> {
    return this.firestore.collection('postulantes').valueChanges();
  }


  getSubcontenidos(contenidoId: string): Observable<any[]> {
    return this.firestore.collection('subcontenidos', ref => ref.where('contenido', '==', contenidoId)).valueChanges();
  }
  guardarHistorial(evaluacion: any): Observable<void> {
    const historialRef = this.firestore.collection('historial');
    return new Observable(observer => {
      historialRef.add(evaluacion).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }


  obtenerHistorial(): Observable<any[]> {
    return this.firestore.collection('historialEvaluaciones', ref => ref.orderBy('fecha', 'desc')).valueChanges();
  }

  guardarEvaluacion(evaluacion: any): Promise<any> {
    return this.firestore.collection('historialEvaluaciones').add(evaluacion);
  }



}
