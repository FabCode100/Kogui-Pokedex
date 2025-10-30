// src/app/Models/pokemon.model.ts
export interface Pokemon {
    codigo: number;
nome: string;
    imagem_url: string;
    tipos: { descricao: string; cor?: string }[];
    status: { nome: string; valor: number }[];  // mudar de label para nome
    favorito: boolean;
    equipe: boolean;
    geracao: number;
}
