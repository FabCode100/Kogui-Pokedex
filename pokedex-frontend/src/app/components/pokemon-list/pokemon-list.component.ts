import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';

@Component({
    selector: 'app-pokemon-list',
    standalone: true,
    imports: [CommonModule, PokemonCardComponent],
    templateUrl: './pokemon-list.component.html',
    styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent {
    @Input() pokemons: any[] = [];

    // funções vindas do componente pai (PokedexComponent)
    @Input() addFavorito!: (pokemon: any) => void;
    @Input() addEquipe!: (pokemon: any) => void;
}
