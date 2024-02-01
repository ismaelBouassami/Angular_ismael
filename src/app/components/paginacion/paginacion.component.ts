import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() currentPage!: number;
  @Input() totalPages!: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.navigateToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.navigateToPage(this.currentPage + 1);
    }
  }

  navigateToPage(page: number): void {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge' // Preserva otros parámetros de consulta
    });
  }
}
  

