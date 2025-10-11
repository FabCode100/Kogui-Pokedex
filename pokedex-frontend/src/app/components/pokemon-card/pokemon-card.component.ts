// src/app/components/pokemon-card/pokemon-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../Models/pokemon.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-pokemon-card',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './pokemon-card.component.html',
    styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent {
    @Input() pokemon!: Pokemon;
    @Output() addFavorito = new EventEmitter<{ nome: string; imagem: string }>();
    @Output() addEquipe = new EventEmitter<{ nome: string; imagem: string }>();

    onAddFavorito() {
        this.addFavorito.emit({ nome: this.pokemon.nome, imagem: this.pokemon.imagem_url });
    }

    onAddEquipe() {
        this.addEquipe.emit({ nome: this.pokemon.nome, imagem: this.pokemon.imagem_url });
    }
}
