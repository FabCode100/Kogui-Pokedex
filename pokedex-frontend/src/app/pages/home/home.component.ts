// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';
import { Pokemon } from '../../Models/pokemon.model';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, PokemonCardComponent, PokemonDetailComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    melhoresPokemons: Pokemon[] = [
        { nome: 'Pikachu', codigo: 25, imagem_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', tipos: [{ descricao: 'Electric', cor: '#F8D030' }], status: [], favorito: false, equipe: false, geracao: this.calcularGeracao(25) },
        { nome: 'Charizard', codigo: 6, imagem_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', tipos: [{ descricao: 'Fire', cor: '#F08030' }, { descricao: 'Flying', cor: '#A890F0' }], status: [], favorito: false, equipe: false, geracao: this.calcularGeracao(6) },
        { nome: 'Blastoise', codigo: 9, imagem_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', tipos: [{ descricao: 'Water', cor: '#6890F0' }], status: [], favorito: false, equipe: false, geracao: this.calcularGeracao(9) },
        { nome: 'Venusaur', codigo: 3, imagem_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', tipos: [{ descricao: 'Grass', cor: '#78C850' }, { descricao: 'Poison', cor: '#A040A0' }], status: [], favorito: false, equipe: false, geracao: this.calcularGeracao(3) },
    ];

    topPlayers = [
        { nome: 'Ash Ketchum', avatar: 'https://i.imgur.com/7Rrb9Iz.png', nivel: 50 },
        { nome: 'Misty', avatar: 'https://i.imgur.com/yjv3JLW.png', nivel: 48 },
        { nome: 'Brock', avatar: 'https://i.imgur.com/2qn61wM.png', nivel: 47 },
    ];

    // Controle modal de detalhe
    selectedPokemon: PokemonDetalhe | null = null;
    showDetail = false;

    openDetail(pokemon: PokemonDetalhe) {
        this.selectedPokemon = pokemon;
        this.showDetail = true;
    }

    closeDetail() {
        this.selectedPokemon = null;
        this.showDetail = false;
    }

    // Função para calcular a geração a partir do código do Pokémon
    calcularGeracao(codigo: number): number {
        if (codigo <= 151) return 1;
        if (codigo <= 251) return 2;
        if (codigo <= 386) return 3;
        if (codigo <= 493) return 4;
        if (codigo <= 649) return 5;
        if (codigo <= 721) return 6;
        if (codigo <= 809) return 7;
        if (codigo <= 905) return 8;
        return 9;
    }

    // Função para transformar número da geração em texto
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
