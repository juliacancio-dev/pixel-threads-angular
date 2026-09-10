import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto.service';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-produto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produto.component.html',
  styleUrl: './produto.component.css'
})
export class ProdutoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);
  private toastService = inject(ToastService);

  produto?: Produto;
  relacionados: Produto[] = [];

  tamanhoSelecionado = 'M';
  tamanhoInvalido = false;
  quantidade = 1;
  abaAtiva: 'descricao' | 'medidas' | 'cuidados' = 'descricao';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.produto = this.produtoService.getProdutoPorId(id);
      if (!this.produto) {
        this.router.navigate(['/']);
        return;
      }
      this.relacionados = this.produtoService.getRelacionados(id, 4);
      this.tamanhoSelecionado = 'M';
      this.tamanhoInvalido = false;
      this.quantidade = 1;
      this.abaAtiva = 'descricao';
    });
  }

  diminuirQuantidade(): void {
    this.quantidade = Math.max(1, this.quantidade - 1);
  }

  aumentarQuantidade(): void {
    this.quantidade = Math.min(10, this.quantidade + 1);
  }

  selecionarAba(aba: 'descricao' | 'medidas' | 'cuidados'): void {
    this.abaAtiva = aba;
  }

  adicionarACesta(): void {
    if (!this.tamanhoSelecionado) {
      this.tamanhoInvalido = true;
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
      return;
    }
    this.tamanhoInvalido = false;
    if (!this.produto) return;

    this.cestaService.adicionarItem({
      produtoId: this.produto.id,
      nome: this.produto.nome,
      emoji: this.produto.emoji,
      imagem: this.produto.imagem,
      gradiente: this.produto.gradiente,
      tamanho: this.tamanhoSelecionado,
      quantidade: this.quantidade,
      preco: this.produto.preco
    });
    this.toastService.mostrar('Camiseta adicionada à cesta!');
  }
}
