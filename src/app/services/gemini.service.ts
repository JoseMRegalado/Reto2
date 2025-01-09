import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  // private apiUrl = 'https://api.gemini.com/v1'; // URL base de la API de Gemini
  private apiKey = 'AIzaSyBtgStBvt0ggRNQZ14Vcb5N-gZhu1pf4SM'; // Reemplaza con tu API Key
  private genAI = new GoogleGenerativeAI(this.apiKey);
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-8b',
  });
  private generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  constructor() { }

  // Modifica el método sendPrompt para incluir los headers
  sendPrompt(prompt: string): Observable<any> {
    const chatSession = this.model.startChat({
      generationConfig: this.generationConfig,
      history: [],
    });

    return new Observable(observer => {
      chatSession.sendMessage(prompt).then((result: { response: { text: () => string } }) => {
        observer.next(result.response.text());
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    });
  }
}
