import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonService {
    private base = environment.apiBase;

    constructor(private http: HttpClient) { }

    // lista (do seu endpoint Django)
    getPokemons(): Observable<any> {
        return this.http.get(`${this.base}/pokemons/`);
    }

    // favoritos do usuário
    getFavoritos(): Observable<Pokemon[]> {
        return this.http.get<Pokemon[]>(`${this.base}/favoritos/`);
    }

    // equipe de batalha
    getEquipe(): Observable<Pokemon[]> {
        return this.http.get<Pokemon[]>(`${this.base}/batalha/`);
    }

    // marcar/desmarcar favorito (exemplo via POST/PUT - ajuste conforme backend)
    toggleFavorito(payload: any) {
        return this.http.post(`${this.base}/pokemons/toggle-favorito/`, payload);
    }

    // adicionar/remover da equipe (ajuste conforme endpoints que criar)
    toggleEquipe(payload: any) {
        return this.http.post(`${this.base}/pokemons/toggle-equipe/`, payload);
    }
}
