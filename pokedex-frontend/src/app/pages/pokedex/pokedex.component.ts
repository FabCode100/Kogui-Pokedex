import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Componentes filhos
import { HeaderComponent } from '../../components/header/header.component';
import { StatsBarComponent } from '../../components/stats-bar/stats-bar.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    StatsBarComponent,
    FilterComponent,
    PokemonListComponent,
    PokemonCardComponent,
  ],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements OnInit {
  loading = true;
  pokemons: any[] = [];
  pokemonsFiltrados: any[] = [];
  favoritos: string[] = [];
  equipe: string[] = [];

  filtroNome: string = '';
  filtroTipo: string = 'All';
  filtroGeracao: number | null = null;

  stats = [
    { label: 'Pokémon', value: 0 },
    { label: 'Tipos', value: 0 },
    { label: 'Gerações', value: 0 }
  ];

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
    this.carregarPokemons();
    this.carregarFavoritos();
    this.carregarEquipe();
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

  // ------------------ CARREGAR POKEMONS ------------------
  carregarPokemons() {
    this.loading = true;
    const token = localStorage.getItem('access_token');

    this.http.get(`${environment.apiBase}/pokemons/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: async (res: any) => {
        const resultados = res?.results || res || [];

        const promises = resultados.map(async (p: any) => {
          const id = p.url?.split('/')[6];
          const detalhe: any = await this.http.get(`https://pokeapi.co/api/v2/pokemon/${id}`).toPromise();

          return {
            numero: detalhe.id,
            nome: detalhe.name,
            imagem: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            tipos: detalhe.types?.map((t: any) => {
              const typeName = t.type.name;
              const tipoEncontrado = this.tipos.find(tp => tp.nome.toLowerCase() === typeName.toLowerCase());
              return {
                nome: typeName,
                cor: tipoEncontrado ? tipoEncontrado.cor : '#A8A878'
              };
            }) || [],
            stats: detalhe.stats?.map((s: any) => ({
              label: s.stat.name,
              valor: s.base_stat
            })) || [],
            favorito: this.favoritos.includes(detalhe.name),
            equipe: this.equipe.includes(detalhe.name),
            geracao: this.calcularGeracao(detalhe.id)
          };
        });

        this.pokemons = await Promise.all(promises);
        this.pokemonsFiltrados = [...this.pokemons];

        this.stats[0].value = this.pokemons.length;
        this.stats[1].value = this.tipos.length;
        this.stats[2].value = 9;

        this.loading = false;
      },
      error: err => {
        console.error('Erro ao carregar pokémons:', err);
        this.loading = false;
      }
    });
  }

  // ------------------ CARREGAR FAVORITOS ------------------
  carregarFavoritos() {
    const token = localStorage.getItem('access_token');
    this.http.get(`${environment.apiBase}/favoritos/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => this.favoritos = res.map((p: any) => p.nome),
      error: err => console.error('Erro ao carregar favoritos:', err)
    });
  }

  // ------------------ CARREGAR EQUIPE ------------------
  carregarEquipe() {
    const token = localStorage.getItem('access_token');
    this.http.get(`${environment.apiBase}/batalha/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => this.equipe = res.map((p: any) => p.nome),
      error: err => console.error('Erro ao carregar equipe:', err)
    });
  }

  // ------------------ FAVORITOS ------------------
  addFavorito(pokemon: any) {
    const token = localStorage.getItem('access_token');
    const body = { nome: pokemon.nome, imagem_url: pokemon.imagem, favorito: !pokemon.favorito };

    this.http.post(`${environment.apiBase}/favoritos/`, body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => pokemon.favorito = !pokemon.favorito,
      error: err => console.error('Erro ao salvar favorito:', err)
    });
  }

  // ------------------ EQUIPE ------------------
  addEquipe(pokemon: any) {
    if (!pokemon.equipe && this.equipe.length >= 6) {
      alert('Você só pode ter até 6 pokémons na equipe!');
      return;
    }

    const token = localStorage.getItem('access_token');
    const body = { nome: pokemon.nome, imagem_url: pokemon.imagem, grupo_batalha: !pokemon.equipe };

    this.http.post(`${environment.apiBase}/batalha/`, body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        pokemon.equipe = !pokemon.equipe;
        if (pokemon.equipe) {
          this.equipe.push(pokemon.nome);
        } else {
          this.equipe = this.equipe.filter(n => n !== pokemon.nome);
        }
      },
      error: err => console.error('Erro ao adicionar à equipe:', err)
    });
  }

  // ------------------ AJUSTE DE CORES ------------------
  getTypeColor(typeName: string) {
    const tipo = this.tipos.find(t => t.nome.toLowerCase() === typeName.toLowerCase());
    return tipo ? tipo.cor : '#A8A878';
  }

  // ------------------ FILTRAR POKÉMONS ------------------
  filtrarPokemons() {
    this.pokemonsFiltrados = this.pokemons.filter(p => {
      const filtrarNome = this.filtroNome
        ? p.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
        : true;
      const filtrarTipo = this.filtroTipo && this.filtroTipo !== 'All'
        ? p.tipos.some((t: any) => t.nome.toLowerCase() === this.filtroTipo.toLowerCase())
        : true;
      const filtrarGeracao = this.filtroGeracao
        ? p.geracao === this.filtroGeracao
        : true;
      return filtrarNome && filtrarTipo && filtrarGeracao;
    });
  }
}
