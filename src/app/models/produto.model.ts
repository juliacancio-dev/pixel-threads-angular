export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  emoji: string;
  imagem: string;
  gradiente: string;
  preco: number;
  precoAntigo?: number;
  novo?: boolean;
  descricao?: string;
}
