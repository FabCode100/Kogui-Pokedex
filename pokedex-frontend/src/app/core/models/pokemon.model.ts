export interface Pokemon {
    id?: number;
    nome?: string;
    codigo?: string;
    imagem_url?: string;
    tipos?: string[]; // opcional
    favorito?: boolean;
    grupo_batalha?: boolean;
}
