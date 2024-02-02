import { Injectable } from '@angular/core';
import { pagination } from '../interfaces/pagination';

@Injectable({
  providedIn: 'root'
})
export class PaginacionService {

  private currentPageService: any;
  pagination: pagination;
  constructor() {    
    this.pagination = {
            total: 0,
            limit: 0,
            first_page:1,
            current_page: 0,
            total_pages: 0,
           
        };
      }

  // Método para establecer la variable compartida
  setVariable(valor: any): void {
    this.currentPageService = valor;
  }

  // Método para obtener la variable compartida
  getVariable(): any {
    return this.currentPageService;
  }
}
