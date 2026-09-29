export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  imagem: string;
  fotos?: string[];
  tamanhos: string[];
  preco: number;
  precoAntigo?: number;
  novo?: boolean;
  descricao?: string;
}
