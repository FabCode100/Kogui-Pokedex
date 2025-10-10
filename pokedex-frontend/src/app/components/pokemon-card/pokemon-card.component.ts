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

    // Função para retornar a classe CSS da barra de progresso
    getStatClass(label: string): string {
        switch (label.toLowerCase()) {
            case 'hp': return 'hp';
            case 'attack': return 'attack';
            case 'defense': return 'defense';
            case 'sp. attack': return 'spattack';
            case 'sp. defense': return 'spdefense';
            case 'speed': return 'speed';
            default: return '';
        }
    }

    onAddFavorito() {
        this.addFavorito.emit({ nome: this.pokemon.nome, imagem: this.pokemon.imagem });
    }

    onAddEquipe() {
        this.addEquipe.emit({ nome: this.pokemon.nome, imagem: this.pokemon.imagem });
    }
}
