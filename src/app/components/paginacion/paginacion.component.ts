import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkListComponent } from '../artwork-list/artwork-list.component';
import { IArtwork } from '../../interfaces/i-artwork';
import { PaginacionService } from '../../services/paginacion.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ArtworkListComponent, RouterLink,FormsModule],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  pageNumberInput: number = 1;


  constructor(private router: Router, private http: HttpClient, private artService: ApiServiceService, private paginacionService: PaginacionService) { }

  ngOnInit(): void {
    this.fetchTotalPages(); 
    this.paginacionService.getVariable();
  }

  fetchTotalPages(): void {
    this.http.get<any>('https://api.artic.edu/api/v1/artworks')
      .subscribe((response: any) => {
        this.totalPages = response.pagination.total_pages;
      });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1; 
      this.paginacionService.setVariable(this.currentPage);

      this.router.navigate(['/artwork/page/', this.currentPage]);
    }
  }
  
  goPage(page:number): void{
    this.currentPage=page;
 this.paginacionService.setVariable(this.currentPage);
    this.router.navigate(['/artwork/page/', page]);
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1; 
      this.paginacionService.setVariable(this.currentPage);
      console.log('sumando paginas '+this.currentPage);
      
    }
  }



  goToPageInput(): void {
    if (this.pageNumberInput >= 1 && this.pageNumberInput <= this.totalPages) {
      this.currentPage = this.pageNumberInput;
      this.paginacionService.setVariable(this.currentPage);
      this.router.navigate(['/artwork/page/', this.currentPage]);
    } else {
      
      alert('El número de página ingresado está fuera de rango.');
    }
  }


 
}