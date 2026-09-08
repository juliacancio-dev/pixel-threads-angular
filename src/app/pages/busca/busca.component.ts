import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto.service';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';

interface FiltroCategoria {
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
  private route = inject(ActivatedRoute);
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);
  private toastService = inject(ToastService);

  todosProdutos: Produto[] = this.produtoService.getProdutos();
  resultados: Produto[] = [];
  termoBusca = '';

  categorias: FiltroCategoria[] = [
    { nome: 'Games', marcado: false },
    { nome: 'Filmes', marcado: false },
    { nome: 'Programação', marcado: false },
    { nome: 'Ciência', marcado: false },
    { nome: 'Ficção', marcado: false }
  ];

  precoMaximo = 150;
  ordenacao = 'relevancia';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const categoria = params.get('categoria');
      this.termoBusca = params.get('q') || '';

      this.categorias.forEach(c => c.marcado = false);
      if (categoria) {
        const alvo = this.mapCategoria(categoria);
        const match = this.categorias.find(c => c.nome.toLowerCase() === alvo.toLowerCase());
        if (match) match.marcado = true;
      }
      this.aplicarFiltros();
    });
  }

  private mapCategoria(slug: string): string {
    const mapa: Record<string, string> = {
      games: 'Games',
      filmes: 'Filmes',
      programacao: 'Programação',
      ciencia: 'Ciência',
      ficcao: 'Ficção'
    };
    return mapa[slug.toLowerCase()] || slug;
  }

  aplicarFiltros(): void {
    const categoriasMarcadas = this.categorias.filter(c => c.marcado).map(c => c.nome);

    let resultado = this.todosProdutos.filter(p => p.preco <= this.precoMaximo);

    if (categoriasMarcadas.length) {
      resultado = resultado.filter(p => categoriasMarcadas.includes(p.categoria));
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
  }

  limparFiltros(): void {
    this.categorias.forEach(c => c.marcado = false);
    this.precoMaximo = 150;
    this.ordenacao = 'relevancia';
    this.termoBusca = '';
    this.aplicarFiltros();
  }

  adicionarACesta(produto: Produto, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cestaService.adicionarItem({
      produtoId: produto.id,
      nome: produto.nome,
      emoji: produto.emoji,
      tamanho: 'M',
      quantidade: 1,
      preco: produto.preco
    });
    this.toastService.mostrar('Item adicionado à cesta ✓');
  }
}
