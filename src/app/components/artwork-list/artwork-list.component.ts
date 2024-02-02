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
import { NavigationEnd, Router } from '@angular/router';
import { PaginacionService } from '../../services/paginacion.service';

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
    private usesService: UsersService,private router: Router,private paginacionService: PaginacionService
  ) {
  }

  ngOnInit(): void {

    this.router.events.subscribe(event => {
      
      if (event instanceof NavigationEnd) {
        if (this.currentPage!=this.paginacionService.getVariable()) {
          this.currentPage= this.paginacionService.getVariable();
        }
      
        const regex = /\/artwork\/page\/\d+/;
        const match = event.url.match(regex);
        if (match) {
          console.log('entra en el cambio de ruta')
          console.log('Número de página:', this.currentPage,) ;
          // Llamar a la función para manejar el cambio de ruta con el número de página
          this.nextPageArtwoks();
        }else{
          this.paginacionService.setVariable(1);
        }
      }
    });


    // console.log(this.onlyFavorites);
    this.loadArtworks();
    if (this.onlyFavorites != 'favorites') {
      this.artService.getArtWorks()
        .subscribe((artworkList: IArtwork[]) => this.quadres = artworkList);
    }
    else {
        
      this.usesService.getUid()
      .then(uid => {
        this.uid = uid;
        console.log('UID:', uid);
        this.usesService.getArtworkIdsByUid(this.uid)
        .then((favorites) => {
          this.favoritesArray = favorites;
          console.log('Favoritos:', favorites);
          this.artService.getArtworksFromIDs(this.favoritesArray)
          .subscribe((artworkList: IArtwork[]) => this.quadres = artworkList.map(art=>{
            if (this.favoritesArray) {
              
            }
            art.like =true;
            return art;

          }));

        });
        
        
        
      })
      .catch(error => {
        console.error('Error al obtener el UID:', error);
        
      });
      
     
      
     
    }


    this.filterService.searchFilter.pipe(
      
      debounceTime(500)
    ).subscribe(filter => this.artService.filterArtWorks(filter));

  }
  
  loadArtworks(): void {
    this.artService.getArtWorks().subscribe((artworks: IArtwork[]) => {
      this.quadres = artworks;
      this.pagedItems = artworks;
    });
  }

  nextPageArtwoks(): void{
    console.log('Entra en el cambio de pagina nxtPageArtworks '+this.currentPage);
    
     this.artService.getArtWorksPage(this.currentPage).subscribe((artworks: IArtwork[])=>{
       this.pagedItems = artworks;
     });
     this.paginacionService.setVariable(this.currentPage);


  }


  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    if (artwork.like) {
      this.usesService.setFavorite(artwork.id + "");
    }else{
      this.usesService.deleteFavorite(artwork.id + "");
    }
    
  }
  uid!: string;
  favoritesArray: string[] = [];
  quadres: IArtwork[] = [];
  pagedItems:IArtwork[]=[];
  currentPage!:number;
  totalPages!:number;
  page!:number;
  filter: string = '';
  @Input() onlyFavorites: string = '';


  
}
