import { Component, Input, OnInit } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { FilterService } from '../../services/filter.service';
import { debounceTime, filter } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { PaginationComponent } from '../paginacion/paginacion.component';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [ArtworkComponent,CommonModule,
    ArtworkRowComponent,
    ArtworkFilterPipe,
    PaginationComponent
  ],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css'
})
export class ArtworkListComponent implements OnInit {

  constructor(private artService: ApiServiceService,
    private filterService: FilterService,
    private usesService: UsersService
  ) {
  }

  ngOnInit(): void {
    console.log(this.onlyFavorites);
    this.loadArtworks();
    if (this.onlyFavorites != 'favorites') {
      this.artService.getArtWorks()
        .subscribe((artworkList: IArtwork[]) => this.quadres = artworkList);
    }
    else {
      this.artService.getArtworksFromIDs(['3752', '11294', '6010'])
        .subscribe((artworkList: IArtwork[]) => this.quadres = artworkList);
    }


    this.filterService.searchFilter.pipe(
      
      debounceTime(500)
    ).subscribe(filter => this.artService.filterArtWorks(filter));

  }
  loadArtworks(): void {
    
    this.artService.getArtWorks().subscribe((artworks: IArtwork[]) => {
      this.quadres = artworks;
      this.totalPages = Math.ceil(this.quadres.length / 6); // NUm de obras a mostrar
      this.setPage(this.currentPage);
    });
  }

  setPage(page: number): void {
    this.currentPage = page;
    let startIndex = (page - 1) * 6;
    let endIndex = Math.min(startIndex + 6, this.quadres.length);

    console.log("start y end "+ startIndex +" " + endIndex);
    this.pagedItems = this.quadres.slice(startIndex, endIndex);

  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPage(this.currentPage);
    }
    console.log('Siguiente pagina ===>'+this.currentPage);
    
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPage(this.currentPage);
    }
  }
  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    this.usesService.setFavorite(artwork.id + "")
  }

  quadres: IArtwork[] = [];
  pagedItems:IArtwork[]=[];
  currentPage=1;
  totalPages!:number;
  page!:number;
  filter: string = '';
  @Input() onlyFavorites: string = '';


  
}
