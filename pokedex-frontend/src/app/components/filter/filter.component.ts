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
  @Output() filterChange = new EventEmitter<string>();
  @Output() generationChange = new EventEmitter<number>();
  @Output() nameChange = new EventEmitter<string>();

  filtroTipo: string = '';
  filtroGeracao: number | null = null;
  filtroNome: string = '';

  selecionarTipo(tipo: string) {
    this.filtroTipo = tipo;
    this.filterChange.emit(this.filtroTipo);
  }

  selecionarGeracao(geracao: number) {
    this.filtroGeracao = geracao;
    this.generationChange.emit(this.filtroGeracao);
  }

  buscarNome(event: any) {
    this.filtroNome = event.target.value;
    this.nameChange.emit(this.filtroNome);
  }
}
