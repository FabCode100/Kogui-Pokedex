import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../Models/pokemon.model';

@Component({
  selector: 'app-battle-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle-sidebar.component.html',
  styleUrls: ['./battle-sidebar.component.scss']
})
export class BattleSidebarComponent {
  @Input() equipe: Pokemon[] = [];

  isOpen = true;
  pokemonSelecionado: Pokemon | null = null;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  trackById(index: number, item: Pokemon): number | string {
    return item.codigo || item.nome;
  }

  selecionarPokemon(pokemon: Pokemon) {
    this.pokemonSelecionado = pokemon;
  }

  getStats(pokemon: Pokemon) {
    if (!pokemon.status) return [];
    return pokemon.status.map((s: any) => [s.nome, s.valor]);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['equipe']) {
      console.log('Equipe atualizada:', this.equipe);
    }
  }
}
