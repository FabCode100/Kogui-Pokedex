import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../Models/pokemon.model';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';

@Component({
    selector: 'app-pokemon-list',
    standalone: true,
    imports: [
        CommonModule,
        PokemonCardComponent,
    ],
    templateUrl: './pokemon-list.component.html',
    styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent {
    // Recebe os pokémons da Pokedex
    @Input() pokemons: Pokemon[] = [];

    // Emite quando o usuário interage
    @Output() verMais = new EventEmitter<PokemonDetalhe>();
    @Output() addFavorito = new EventEmitter<any>();
    @Output() addEquipe = new EventEmitter<any>();


    // Função para trackBy no *ngFor
    trackByCodigo(index: number, pokemon: Pokemon): number {
        return pokemon.codigo;
    }

    // Dispara evento quando o cartão é clicado

    onVerMais(pokemon: PokemonDetalhe) {
        this.verMais.emit(pokemon);
    }

    onAddFavorito(event: any) {
        this.addFavorito.emit(event);
    }

    onAddEquipe(event: any) {
        this.addEquipe.emit(event); // envia o { pokemon, ativo }
    }

}
