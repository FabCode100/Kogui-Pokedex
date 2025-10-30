// src/app/models/pokemon-detalhe.model.ts
export interface PokemonDetalhe {
    codigo: number;
    nome: string;
    imagem_url: string;
    tipos: { descricao: string; cor?: string }[];
    status: { nome: string; valor: number }[];
    favorito: boolean;
    equipe: boolean;
    geracao: number;

    // Campos adicionais para detalhe
    habilidades?: { nome: string; descricao?: string }[];
    movimentos?: { nome: string; tipo: string; power?: number; pp?: number; categoria?: string; level?: number }[];
    evolutionChain?: { nome: string; imagem_url: string }[];
    formasAlternativas?: string[]; // URLs ou nomes
    sprites?: string[]; // URLs para carrossel
}
