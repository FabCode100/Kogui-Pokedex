export interface Pokemon {
    numero: number;
    nome: string;
    imagem: string;
    tipos: { nome: string; cor: string }[];
    stats: { label: string; valor: number }[];
    favorito: boolean;
    equipe: boolean;
    geracao: number;
}
