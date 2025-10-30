import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../Models/pokemon.model';
import { MatButtonModule } from '@angular/material/button';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-pokemon-card',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './pokemon-card.component.html',
    styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent implements OnInit, OnChanges {
    @Input() pokemon!: Pokemon;
    @Output() clickVerMais = new EventEmitter<PokemonDetalhe>();
    @Output() clickFavorito = new EventEmitter<any>();
    @Output() clickEquipe = new EventEmitter<any>();

    favoritoAtivo = false;
    equipeAtiva = false;

    ngOnInit() {
        this.syncStates();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pokemon'] && changes['pokemon'].currentValue) {
            this.syncStates();
        }
    }

    private syncStates() {
        this.favoritoAtivo = !!this.pokemon.favorito;
        this.equipeAtiva = !!this.pokemon.equipe;
    }

    verMais() {
        this.clickVerMais.emit(this.pokemon);
    }

    adicionarFavorito() {
        this.favoritoAtivo = !this.favoritoAtivo;
        this.pokemon.favorito = this.favoritoAtivo;
        this.clickFavorito.emit({ pokemon: this.pokemon, ativo: this.favoritoAtivo });
    }

    adicionarEquipe() {
        // botão híbrido
        this.equipeAtiva = !this.equipeAtiva;
        this.pokemon.equipe = this.equipeAtiva;

        // emite o evento para o componente pai tratar a lógica
        this.clickEquipe.emit({
            pokemon: { ...this.pokemon }, // envia uma cópia para evitar referência duplicada
            ativo: this.equipeAtiva
        });
    }

    getNomeGeracao(geracao: number | null): string {
        switch (geracao) {
            case 1: return 'Primeira Geração';
            case 2: return 'Segunda Geração';
            case 3: return 'Terceira Geração';
            case 4: return 'Quarta Geração';
            case 5: return 'Quinta Geração';
            case 6: return 'Sexta Geração';
            case 7: return 'Sétima Geração';
            case 8: return 'Oitava Geração';
            case 9: return 'Nona Geração';
            default: return 'Desconhecida';
        }
    }
}
