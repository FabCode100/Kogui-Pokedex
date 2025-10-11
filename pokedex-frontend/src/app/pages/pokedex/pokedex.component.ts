import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pokemon } from '../../Models/pokemon.model';

import { HeaderComponent } from '../../components/header/header.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FilterComponent, PokemonListComponent],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements OnInit {
  loading = true;
  pokemons: Pokemon[] = [];
  pokemonsFiltrados: Pokemon[] = [];
  favoritos: string[] = [];
  equipe: string[] = [];

  filtroNome = '';
  filtroTipo = 'All';
  filtroGeracao: number | null = null;

  tipos = [
    { nome: 'All', cor: '#A8A878' },
    { nome: 'Fire', cor: '#F08030' },
    { nome: 'Water', cor: '#6890F0' },
    { nome: 'Grass', cor: '#78C850' },
    { nome: 'Electric', cor: '#F8D030' },
    { nome: 'Bug', cor: '#A8B820' },
    { nome: 'Fairy', cor: '#EE99AC' },
    { nome: 'Normal', cor: '#A8A878' },
    { nome: 'Poison', cor: '#A040A0' },
    { nome: 'Ground', cor: '#E0C068' },
    { nome: 'Rock', cor: '#B8A038' },
    { nome: 'Fighting', cor: '#C03028' },
    { nome: 'Psychic', cor: '#F85888' },
    { nome: 'Ghost', cor: '#705898' },
    { nome: 'Ice', cor: '#98D8D8' },
    { nome: 'Dragon', cor: '#7038F8' },
    { nome: 'Dark', cor: '#705848' },
    { nome: 'Steel', cor: '#B8B8D0' },
    { nome: 'Flying', cor: '#A890F0' }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.carregarFavoritos();
    this.carregarEquipe();
    this.carregarPokemons();
  }

  calcularGeracao(id: number): number {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  }

  carregarFavoritos() {
    const token = localStorage.getItem('access_token');
    this.http.get<any[]>(`${environment.apiBase}/favoritos/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => this.favoritos = res.map(p => p.nome));
  }

  carregarEquipe() {
    const token = localStorage.getItem('access_token');
    this.http.get<any[]>(`${environment.apiBase}/batalha/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => this.equipe = res.map(p => p.nome));
  }

  carregarPokemons() {
    this.loading = true;
    const token = localStorage.getItem('access_token');

    this.http.get<any[]>(`${environment.apiBase}/pokemons/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(res => {
      this.pokemons = res.map(p => ({
        codigo: Number(p.codigo),
        nome: p.nome,
        imagem_url: p.imagem_url, // mantém o nome original
        geracao: p.geracao || this.calcularGeracao(Number(p.codigo)),
        favorito: this.favoritos.includes(p.nome),
        equipe: this.equipe.includes(p.nome),
        tipos: p.tipos.map((t: any) => ({
          descricao: t.descricao,
          cor: this.getTypeColor(t.descricao)
        })),
        status: p.stats || []  // mapeia stats do backend para status
      }));
      this.pokemonsFiltrados = [...this.pokemons];
      this.loading = false;
    });
  }

  addFavorito(pokemon: Pokemon) {
    const token = localStorage.getItem('access_token');
    const body = { nome: pokemon.nome, imagem_url: pokemon.imagem_url, favorito: !pokemon.favorito };
    this.http.post(`${environment.apiBase}/favoritos/`, body, { headers: { Authorization: `Bearer ${token}` } })
      .subscribe(() => pokemon.favorito = !pokemon.favorito);
  }

  addEquipe(pokemon: Pokemon) {
    if (!pokemon.equipe && this.equipe.length >= 6) {
      alert('Você só pode ter até 6 pokémons na equipe!');
      return;
    }
    const token = localStorage.getItem('access_token');
    const body = { nome: pokemon.nome, imagem_url: pokemon.imagem_url, grupo_batalha: !pokemon.equipe };
    this.http.post(`${environment.apiBase}/batalha/`, body, { headers: { Authorization: `Bearer ${token}` } })
      .subscribe(() => {
        pokemon.equipe = !pokemon.equipe;
        if (pokemon.equipe) this.equipe.push(pokemon.nome);
        else this.equipe = this.equipe.filter(n => n !== pokemon.nome);
      });
  }

  getTypeColor(typeName: string) {
    const tipo = this.tipos.find(t => t.nome.toLowerCase() === typeName.toLowerCase());
    return tipo ? tipo.cor : '#A8A878';
  }

  filtrarPokemons() {
    this.pokemonsFiltrados = this.pokemons.filter(p => {
      const filtrarNome = this.filtroNome ? p.nome.toLowerCase().includes(this.filtroNome.toLowerCase()) : true;
      const filtrarTipo = this.filtroTipo !== 'All' ? p.tipos.some(t => t.descricao.toLowerCase() === this.filtroTipo.toLowerCase()) : true;
      const filtrarGeracao = this.filtroGeracao ? p.geracao === this.filtroGeracao : true;
      return filtrarNome && filtrarTipo && filtrarGeracao;
    });
  }
}
