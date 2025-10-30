// src/app/components/pokemon-detail/pokemon-detail.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, MatProgressSpinnerModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss'],
})
export class PokemonDetailComponent implements OnChanges {
  @Input() pokemon!: PokemonDetalhe;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  activeSpriteIndex = 0;
  activeTab: 'about' | 'stats' | 'evolution' | 'moves' = 'about';

  tiposText = '';
  habilidadesText = '';
  loadingModal = false; // nova variável de controle
  ngOnChanges() {
    if (this.pokemon) {
      this.tiposText = this.pokemon.tipos.map(t => t.descricao).join(', ');
      this.habilidadesText = this.pokemon.habilidades?.map(a => a.nome).join(', ') ?? '';
      this.activeSpriteIndex = 0;
      this.loadingModal = false; // terminou o carregamento quando recebe pokemon
    } else {
      this.loadingModal = true; // começa loading se pokemon ainda não chegou
    }
  }

  nextSprite() {
    if (!this.pokemon?.sprites?.length) return;
    this.activeSpriteIndex =
      (this.activeSpriteIndex + 1) % this.pokemon.sprites.length;
  }

  prevSprite() {
    if (!this.pokemon?.sprites?.length) return;
    this.activeSpriteIndex =
      (this.activeSpriteIndex - 1 + this.pokemon.sprites.length) %
      this.pokemon.sprites.length;
  }
  // Gradiente baseado nos dois primeiros tipos
  getHeaderColor(): string {
    if (!this.pokemon || !this.pokemon.tipos?.length) return '#0f172a';

    const typeColors: { [key: string]: string } = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
      normal: '#A8A878'
    };

    const primary = typeColors[this.pokemon.tipos[0].descricao.toLowerCase()] || '#0f172a';
    const secondary = this.pokemon.tipos[1]
      ? typeColors[this.pokemon.tipos[1].descricao.toLowerCase()] || primary
      : primary; // se não tiver segundo tipo, usa a cor do primeiro

    return `linear-gradient(90deg, ${primary}, ${secondary})`;
  }


  setTab(tab: 'about' | 'stats' | 'evolution' | 'moves') {
    this.activeTab = tab;
  }

  onClose() {
    this.close.emit();
  }

  toggleFavorite() {
    this.pokemon.favorito = !this.pokemon.favorito;
  }
}
