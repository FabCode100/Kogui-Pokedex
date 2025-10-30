// src/app/components/pokemon-detail/pokemon-detail.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
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

  ngOnChanges() {
    if (this.pokemon) {
      this.tiposText = this.pokemon.tipos.map(t => t.descricao).join(', ');
      this.habilidadesText = this.pokemon.habilidades?.map(a => a.nome).join(', ') ?? '';
      this.activeSpriteIndex = 0;
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
