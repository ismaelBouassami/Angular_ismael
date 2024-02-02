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
            current_page: 1,
            total_pages: 0,
           
        };
      }


  setVariable(valor: number): void {
    this.pagination.current_page = valor;
  }

  
  getVariable(): number {
    return this.pagination.current_page;
  }
}
