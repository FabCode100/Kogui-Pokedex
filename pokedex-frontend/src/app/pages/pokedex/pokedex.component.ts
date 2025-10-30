import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pokemon } from '../../Models/pokemon.model';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { BattleSidebarComponent } from '../../components/battle-sidebar/battle-sidebar.component';
import { PokemonDetalhe } from '../../Models/pokemon-detalhe.model';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FilterComponent, PokemonListComponent, BattleSidebarComponent, PokemonDetailComponent],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements OnInit {

  loading = true;
  pokemons: Pokemon[] = [];
  pokemonsFiltrados: Pokemon[] = [];
  favoritos: string[] = [];
  batalhaAberta = false;
  equipe: any[] = [];
  // Função trackBy para otimização do ngFor
  trackById(index: number, item: any): number | string {
    return item.id; // ou item.nome se não tiver id
  }
  toggleBatalha() {
    this.batalhaAberta = !this.batalhaAberta;
  }

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

  constructor(private http: HttpClient, private router: Router) { }
  async ngOnInit() {
    try {
      await this.carregarFavoritos();
      await this.carregarEquipe(); // ainda precisa retornar uma Promise
      this.carregarPokemons();     // só mapeia após favoritos e equipe estarem prontos
    } catch (err) {
      console.error('Erro ao inicializar dados:', err);
    }
  }
  goHome() {
    this.router.navigate(['/']);
  }

  goLogin() {
    this.router.navigate(['/login']);
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
  carregarFavoritos(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${environment.apiBase}/favoritos/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: res => {
          this.favoritos = res.map(p => p.nome);
          resolve();
        },
        error: err => {
          console.error('Erro ao carregar favoritos:', err);
          reject(err);
        }
      });
    });
  }
  private normalizarPokemon(p: any): Pokemon {
    // Normaliza tipos com cor
    const tipos = Array.isArray(p.tipos)
      ? p.tipos.map((t: any) => {
        const tipoEncontrado = this.tipos.find(
          tp => tp.nome.toLowerCase() === t.descricao.toLowerCase()
        );
        return {
          descricao: t.descricao,
          cor: tipoEncontrado ? tipoEncontrado.cor : '#A8A878'
        };
      })
      : [];

    // Normaliza stats
    const status = p.stats
      ? Object.entries(p.stats).map(([nome, valor]) => ({
        nome,
        valor: valor as number
      }))
      : p.status
        ? Array.isArray(p.status)
          ? p.status
          : []
        : [];

    return {
      codigo: p.codigo ?? p.id ?? 0,
      nome: p.nome,
      imagem_url: p.imagem_url,
      tipos,
      status,
      favorito: p.favorito ?? false,
      equipe: p.grupo_batalha ?? p.equipe ?? false,
      geracao: p.geracao ?? this.calcularGeracao(Number(p.codigo)),
    };
  }

  async carregarEquipe(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${environment.apiBase}/batalha/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: res => {
          console.log('API retornou:', JSON.stringify(res, null, 2));

          // Usa a função utilitária para normalizar todos os pokémon
          this.equipe = res.map(p => this.normalizarPokemon(p));

          console.log('✅ Equipe atualizada com stats normalizados:', this.equipe);
          resolve();
        },
        error: err => {
          console.error('❌ Erro ao carregar equipe:', err);
          reject(err);
        }
      });
    });
  }



  carregarDetalhePokemon(codigo: number) {
    const token = localStorage.getItem('access_token');
    this.http.get<PokemonDetalhe>(`${environment.apiBase}/pokemon/${codigo}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      res => {
        this.openDetail(res); // abre o modal ou painel de detalhe
      },
      err => console.error('Erro ao carregar detalhe do Pokémon:', err)
    );
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
        imagem_url: p.imagem_url,
        geracao: p.geracao || this.calcularGeracao(Number(p.codigo)),
        favorito: this.favoritos.includes(p.nome),
        equipe: this.equipe.some(e => e.nome === p.nome),
        tipos: p.tipos.map((t: any) => ({
          descricao: t.descricao,
          cor: this.getTypeColor(t.descricao)
        })),
        // ✅ Guarda os stats completos invisíveis no card
        status: p.stats
          ? Object.entries(p.stats).map(([nome, valor]) => ({ nome, valor: valor as number }))
          : []
      }));

      this.pokemonsFiltrados = [...this.pokemons];
      this.loading = false;
    });
  }

  addFavorito(event: { pokemon: Pokemon; ativo: boolean }) {
    const { pokemon } = event;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const body = { nome: pokemon.nome, imagem_url: pokemon.imagem_url, favorito: !pokemon.favorito };

    this.http.post(`${environment.apiBase}/favoritos/`, body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => {
      pokemon.favorito = !pokemon.favorito;
      if (pokemon.favorito && !this.favoritos.includes(pokemon.nome)) {
        this.favoritos.push(pokemon.nome);
      } else {
        this.favoritos = this.favoritos.filter(n => n !== pokemon.nome);
      }
    });
  }


  addEquipe(event: { pokemon: Pokemon; ativo: boolean }) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const { pokemon, ativo } = event;

    // Converte stats para objeto para enviar ao backend
    const statsObject = Array.isArray(pokemon.status)
      ? Object.fromEntries(pokemon.status.map(s => [s.nome, s.valor]))
      : {};

    const body = {
      nome: pokemon.nome,
      imagem_url: pokemon.imagem_url,
      grupo_batalha: ativo,
      stats: statsObject,
      geracao: pokemon.geracao,
      tipos: pokemon.tipos?.map(t => ({ descricao: t.descricao })) || []
    };

    this.http.post(`${environment.apiBase}/batalha/`, body, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        pokemon.equipe = ativo;

        if (ativo) {
          const jaExiste = this.equipe.some(p => p.nome === pokemon.nome);
          if (!jaExiste) this.equipe.push(this.normalizarPokemon(pokemon));
        } else {
          this.equipe = this.equipe.filter(p => p.nome !== pokemon.nome);
        }

        console.log('✅ Equipe atualizada:', this.equipe);
      },
      error: err => console.error('❌ Erro ao atualizar equipe:', err)
    });
  }





  getTypeColor(typeName: string) {
    const tipo = this.tipos.find(t => t.nome.toLowerCase() === typeName.toLowerCase());
    return tipo ? tipo.cor : '#A8A878';
  }
  selectedPokemon: PokemonDetalhe | null = null;
  showDetail = false;

  openDetail(pokemon: PokemonDetalhe) {
    // Abre o modal imediatamente (sem travar a UI)
    this.selectedPokemon = pokemon;
    this.showDetail = true;

    // Busca detalhes completos do backend
    const token = localStorage.getItem('access_token');
    this.http.get<PokemonDetalhe>(`${environment.apiBase}/pokemons/${pokemon.codigo}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.selectedPokemon = res; // substitui pelos dados detalhados
      },
      error: (err) => {
        console.error('Erro ao carregar detalhe do Pokémon:', err);
      }
    });
  }


  closeDetail() {
    this.showDetail = false;
    this.selectedPokemon = null;
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
