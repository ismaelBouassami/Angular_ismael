import { NumberSymbol } from "@angular/common";

export interface  pagination {
    total: number;
    limit: number;
    first_page: number;  
    current_page: number; 
    total_pages:number ;
    // "prev_url": "https://api.artic.edu/api/v1/artworks?page=2&limit=12",
    // "next_url": "https://api.artic.edu/api/v1/artworks?page=4&limit=12"
}