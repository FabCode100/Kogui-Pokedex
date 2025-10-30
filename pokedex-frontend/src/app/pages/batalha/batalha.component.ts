import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-batalha',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './batalha.component.html',
  styleUrls: ['./batalha.component.scss']
})
export class BatalhaComponent implements OnInit {
  equipe: any[] = [];
  tipos = [
    { nome: 'grass', cor: '#78C850' },
    { nome: 'fire', cor: '#F08030' },
    { nome: 'water', cor: '#6890F0' },
    { nome: 'electric', cor: '#F8D030' },
    { nome: 'poison', cor: '#A040A0' },
    { nome: 'bug', cor: '#A8B820' },
    { nome: 'normal', cor: '#A8A878' },
    { nome: 'flying', cor: '#A890F0' },
    { nome: 'ground', cor: '#E0C068' },
    { nome: 'rock', cor: '#B8A038' },
    { nome: 'fighting', cor: '#C03028' },
    { nome: 'psychic', cor: '#F85888' },
    { nome: 'ghost', cor: '#705898' },
    { nome: 'ice', cor: '#98D8D8' },
    { nome: 'dragon', cor: '#7038F8' },
    { nome: 'dark', cor: '#705848' },
    { nome: 'steel', cor: '#B8B8D0' },
    { nome: 'fairy', cor: '#EE99AC' }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.carregarEquipe();
  }

  async carregarEquipe() {
    const token = localStorage.getItem('access_token');
    this.http.get<any[]>(`${environment.apiBase}/batalha/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      console.log('API retornou:', JSON.stringify(res, null, 2));
      this.equipe = res.map(p => ({
        codigo: p.codigo,
        nome: p.nome,
        imagem_url: p.imagem_url,
        tipos: Array.isArray(p.tipos) ? p.tipos.map((t: any) => {
          const tipoEncontrado = this.tipos.find(tp => tp.nome.toLowerCase() === t.descricao.toLowerCase());
          return {
            descricao: t.descricao,
            cor: tipoEncontrado ? tipoEncontrado.cor : '#A8A878'
          };
        }) : [],
        // Transformando objeto stats em array
        status: p.stats
          ? Object.entries(p.stats).map(([key, value]) => ({ nome: key, valor: value as number }))
          : [],
        favorito: p.favorito,
        equipe: p.grupo_batalha,
        geracao: p.geracao
      }));
    }, err => console.error('Erro ao carregar equipe:', err));

  }

  removerEquipe(nome: string) {
    const token = localStorage.getItem('access_token');
    this.http.delete(`${environment.apiBase}/batalha/`, {
      headers: { Authorization: `Bearer ${token}` },
      body: { nome }
    }).subscribe(() => {
      this.equipe = this.equipe.filter(p => p.nome !== nome);
      alert(`${nome} removido da equipe!`);
    }, err => console.error('Erro ao remover da equipe:', err));
  }

  getTypeColor(typeName: string) {
    const tipo = this.tipos.find(t => t.nome.toLowerCase() === typeName.toLowerCase());
    return tipo ? tipo.cor : '#A8A878';
  }

  // Dummy handler para bind de addEquipe do PokemonCardComponent
  handleAddEquipe(pokemon: any) {
    // Pode implementar lógica futura se quiser permitir mover/remover da equipe
    console.log('Evento addEquipe disparado para:', pokemon.nome);
  }
}
