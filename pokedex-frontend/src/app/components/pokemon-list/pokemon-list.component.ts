// src/app/components/pokemon-list/pokemon-list.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { Pokemon } from '../../Models/pokemon.model';

@Component({
    selector: 'app-pokemon-list',
    standalone: true,
    imports: [CommonModule, PokemonCardComponent],
    templateUrl: './pokemon-list.component.html',
    styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent {
    @Input() pokemons: Pokemon[] = [];
    @Input() addFavorito!: (pokemon: Pokemon) => void;
    @Input() addEquipe!: (pokemon: Pokemon) => void;
}
