import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Produto } from '../models/produto.model';

export const TAMANHOS_ADULTO = ['P', 'M', 'G', 'GG'];
export const TAMANHOS_INFANTIL = ['2', '4', '6', '8', '10', '12'];

/** Endereço da API da loja (api/server.js). Suba com: npm run api */
export const URL_API = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);

  private produtos: Produto[] = [];

  /** True se a última tentativa de buscar os produtos na API falhou (API fora do ar). */
  erroAoCarregar = false;

  /**
   * Busca os produtos no banco, pela API. Roda uma vez quando o site abre (ver app.config.ts),
   * antes das páginas aparecerem, então o resto do site pode ler os produtos direto.
   */
  async carregarProdutos(): Promise<void> {
    try {
      this.produtos = await firstValueFrom(this.http.get<Produto[]>(`${URL_API}/produtos`));
      this.erroAoCarregar = false;
    } catch (erro) {
      console.error('Não foi possível buscar os produtos na API. Ela está rodando? (npm run api)', erro);
      this.produtos = [];
      this.erroAoCarregar = true;
    }
  }

  /** Troca a lista de produtos sem passar pela API (usado nos testes). */
  definirProdutos(produtos: Produto[]): void {
    this.produtos = produtos;
  }

  listarProdutos(): Produto[] {
    return this.produtos;
  }

  /** Tamanho sugerido para compras rápidas (botão "+" dos cards). */
  obterTamanhoPadrao(produto: Produto): string {
    return produto.tamanhos[Math.floor((produto.tamanhos.length - 1) / 2)];
  }

  obterProdutoPorId(id: number): Produto | undefined {
    return this.produtos.find(p => p.id === id);
  }

  obterRelacionados(idAtual: number, quantidade = 4): Produto[] {
    return this.produtos.filter(p => p.id !== idAtual).slice(0, quantidade);
  }

  buscar(termo: string, categoria?: string): Produto[] {
    let resultado = this.produtos;
    if (categoria) {
      resultado = resultado.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    if (termo) {
      const termoBusca = termo.toLowerCase();
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(termoBusca));
    }
    return resultado;
  }
}
