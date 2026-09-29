import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService, TAMANHOS_ADULTO, TAMANHOS_INFANTIL } from '../../services/produto.service';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';

interface FiltroOpcao {
  nome: string;
  marcado: boolean;
}

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './busca.component.html',
  styleUrl: './busca.component.css'
})
export class BuscaComponent implements OnInit {
  private rota = inject(ActivatedRoute);
  private servicoProduto = inject(ProdutoService);
  private servicoCesta = inject(CestaService);
  private servicoToast = inject(ToastService);

  todosProdutos: Produto[] = this.servicoProduto.listarProdutos();
  resultados: Produto[] = [];
  termoBusca = '';

  tamanhosAdulto: FiltroOpcao[] = TAMANHOS_ADULTO.map(nome => ({ nome, marcado: false }));
  tamanhosInfantil: FiltroOpcao[] = TAMANHOS_INFANTIL.map(nome => ({ nome, marcado: false }));

  categorias: FiltroOpcao[] = [
    { nome: 'Games', marcado: false },
    { nome: 'Filmes', marcado: false },
    { nome: 'Animes', marcado: false },
    { nome: 'Heróis', marcado: false },
    { nome: 'Infantil', marcado: false },
    { nome: 'Música', marcado: false }
  ];

  precoMaximo = 150;
  ordenacao = 'relevancia';

  paginaAtual = 1;
  readonly itensPorPagina = 8;

  ngOnInit(): void {
    this.rota.queryParamMap.subscribe(parametros => {
      const categoria = parametros.get('categoria');
      this.termoBusca = parametros.get('q') || '';

      this.categorias.forEach(c => c.marcado = false);
      if (categoria) {
        const alvo = this.mapearCategoria(categoria);
        const encontrada = this.categorias.find(c => c.nome.toLowerCase() === alvo.toLowerCase());
        if (encontrada) encontrada.marcado = true;
      }
      this.aplicarFiltros();
    });
  }

  private mapearCategoria(identificador: string): string {
    const mapa: Record<string, string> = {
      games: 'Games',
      filmes: 'Filmes',
      animes: 'Animes',
      herois: 'Heróis',
      infantil: 'Infantil',
      musica: 'Música'
    };
    return mapa[identificador.toLowerCase()] || identificador;
  }

  aplicarFiltros(): void {
    const categoriasMarcadas = this.categorias.filter(c => c.marcado).map(c => c.nome);

    let resultado = this.todosProdutos.filter(p => p.preco <= this.precoMaximo);

    if (categoriasMarcadas.length) {
      resultado = resultado.filter(p => categoriasMarcadas.includes(p.categoria));
    }

    const tamanhosMarcados = [...this.tamanhosAdulto, ...this.tamanhosInfantil].filter(t => t.marcado).map(t => t.nome);
    if (tamanhosMarcados.length) {
      resultado = resultado.filter(p => p.tamanhos.some(t => tamanhosMarcados.includes(t)));
    }

    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(termo));
    }

    if (this.ordenacao === 'menor-preco') {
      resultado = [...resultado].sort((a, b) => a.preco - b.preco);
    } else if (this.ordenacao === 'maior-preco') {
      resultado = [...resultado].sort((a, b) => b.preco - a.preco);
    } else if (this.ordenacao === 'recentes') {
      resultado = [...resultado].sort((a, b) => b.id - a.id);
    }

    this.resultados = resultado;
    this.paginaAtual = 1;
  }

  get totalPaginas(): number {
    return Math.ceil(this.resultados.length / this.itensPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get resultadosDaPagina(): Produto[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.resultados.slice(inicio, inicio + this.itensPorPagina);
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) return;
    this.paginaAtual = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limparFiltros(): void {
    this.categorias.forEach(c => c.marcado = false);
    [...this.tamanhosAdulto, ...this.tamanhosInfantil].forEach(t => t.marcado = false);
    this.precoMaximo = 150;
    this.ordenacao = 'relevancia';
    this.termoBusca = '';
    this.aplicarFiltros();
  }

  adicionarACesta(produto: Produto, evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.servicoCesta.adicionarItem({
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      tamanho: this.servicoProduto.obterTamanhoPadrao(produto),
      quantidade: 1,
      preco: produto.preco
    });
    this.servicoToast.mostrar('Item adicionado à cesta ✓');
  }
}
