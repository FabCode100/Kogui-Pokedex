import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input() tipos: { nome: string; cor: string }[] = [];

  // Emite alterações de filtro
  @Output() filterChange = new EventEmitter<string>();
  @Output() generationChange = new EventEmitter<number>();
  @Output() nameChange = new EventEmitter<string>();
  @Output() favoriteChange = new EventEmitter<boolean | null>(); // ✅ novo

  filtroTipo: string = '';
  filtroGeracao: number | null = null;
  filtroNome: string = '';
  filtroFavorito: boolean | null = null; // true = só favoritos, false = todos
  showTipos = false;
  showGeracoes = false;
  showFavoritos = false;

  selecionarTipo(tipo: string) {
    this.filtroTipo = tipo;
    this.filterChange.emit(this.filtroTipo);
  }

  selecionarGeracao(geracao: number) {
    this.filtroGeracao = geracao;
    this.generationChange.emit(this.filtroGeracao);
  }

  selecionarFavorito(valor: boolean | null) {
    this.filtroFavorito = valor;
    console.log('[FilterComponent] Emite filtroFavorito:', valor);
    this.favoriteChange.emit(valor);
  }

  buscarNome(event: any) {
    this.filtroNome = event.target.value;
    this.nameChange.emit(this.filtroNome);
  }
}
