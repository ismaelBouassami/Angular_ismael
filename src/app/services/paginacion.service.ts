import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginacionService {

  private currentPageService: any;
  
  constructor() {}

  // Método para establecer la variable compartida
  setVariable(valor: any): void {
    this.currentPageService = valor;
  }

  // Método para obtener la variable compartida
  getVariable(): any {
    return this.currentPageService;
  }
}
