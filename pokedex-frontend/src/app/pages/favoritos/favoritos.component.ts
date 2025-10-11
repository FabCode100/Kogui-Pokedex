import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';

interface Pokemon {
  codigo: number;
  nome: string;
  imagem_url: string;
  tipos: { descricao: string; cor?: string }[];
  status: { nome: string; valor: number }[];
  favorito: boolean;
  equipe: boolean;
  geracao: number;
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.scss']
})
export class FavoritosComponent implements OnInit {
  favoritos: Pokemon[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.carregarFavoritos();
  }

  carregarFavoritos() {
    const token = localStorage.getItem('access_token');

    this.http.get<Pokemon[]>(`${environment.apiBase}/favoritos/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        // Assume que o backend já envia tudo no formato certo para os cards
        this.favoritos = res.map(p => ({
          ...p,
          favorito: true,
          equipe: p.equipe || false
        }));
      },
      error: (err) => console.error('Erro ao carregar favoritos:', err)
    });
  }

  removerFavorito(nome: string) {
    const token = localStorage.getItem('access_token');
    this.http.delete(`${environment.apiBase}/favoritos/`, {
      headers: { Authorization: `Bearer ${token}` },
      body: { nome }
    }).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(p => p.nome !== nome);
        alert(`${nome} removido dos favoritos!`);
      },
      error: (err) => console.error('Erro ao remover favorito:', err)
    });
  }
}
