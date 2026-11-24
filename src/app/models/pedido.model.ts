import { Endereco } from './usuario.model';

export interface ItemPedido {
  produtoId: number;
  nome: string;
  imagem?: string;
  tamanho: string;
  quantidade: number;
  preco: number;
}

/** Pedido como a API devolve (api/server.js). Nome e preço dos itens são os do banco na hora da compra. */
export interface Pedido {
  codigoPedido: number;
  clienteId: number | null;
  data: string;
  status: string;
  subtotal: number;
  frete: number;
  cupom: string | null;
  desconto: number;
  total: number;
  itens: ItemPedido[];
  enderecoEntrega?: Endereco;
}

export interface Cupom {
  codigo: string;
  /** Desconto em %, ex.: 10 para 10%. */
  percentual: number;
  /** Cupom desligado não vale nas compras, mas continua cadastrado. */
  ativo?: boolean;
}

/** O que o site manda para gravar um pedido. O preço não vai: a API usa o do banco. */
export interface NovoPedido {
  clienteId: number;
  itens: { produtoId: number; tamanho: string; quantidade: number }[];
  /** Código do cupom aplicado; a API recalcula o desconto. */
  cupom?: string;
}
