export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  emoji: string;
  gradiente: string;
  preco: number;
  precoAntigo?: number;
  novo?: boolean;
  descricao?: string;
}
