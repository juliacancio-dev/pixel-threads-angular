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
  private rota = inject(ActivatedRoute);
  private roteador = inject(Router);
  private servicoProduto = inject(ProdutoService);
  private servicoCesta = inject(CestaService);
  private servicoToast = inject(ToastService);

  produto?: Produto;
  relacionados: Produto[] = [];

  tamanhoSelecionado = '';
  tamanhoInvalido = false;
  quantidade = 1;
  abaAtiva: 'descricao' | 'medidas' | 'cuidados' = 'descricao';
  fotoAtiva = 0;

  ngOnInit(): void {
    this.rota.paramMap.subscribe(parametros => {
      const id = Number(parametros.get('id'));
      this.produto = this.servicoProduto.obterProdutoPorId(id);
      if (!this.produto) {
        this.roteador.navigate(['/']);
        return;
      }
      this.relacionados = this.servicoProduto.obterRelacionados(id, 4);
      this.tamanhoSelecionado = this.servicoProduto.obterTamanhoPadrao(this.produto);
      this.tamanhoInvalido = false;
      this.quantidade = 1;
      this.abaAtiva = 'descricao';
      this.fotoAtiva = 0;
    });
  }

  get fotos(): string[] {
    return this.produto?.fotos ?? (this.produto ? [this.produto.imagem] : []);
  }

  selecionarFoto(indice: number): void {
    this.fotoAtiva = indice;
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

  adicionarACesta(): boolean {
    if (!this.tamanhoSelecionado) {
      this.tamanhoInvalido = true;
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
      return false;
    }
    this.tamanhoInvalido = false;
    if (!this.produto) return false;

    this.servicoCesta.adicionarItem({
      produtoId: this.produto.id,
      nome: this.produto.nome,
      imagem: this.produto.imagem,
      tamanho: this.tamanhoSelecionado,
      quantidade: this.quantidade,
      preco: this.produto.preco
    });
    this.servicoToast.mostrar('Camiseta adicionada à cesta!');
    return true;
  }

  comprarAgora(): void {
    if (this.adicionarACesta()) {
      this.roteador.navigate(['/cesta']);
    }
  }
}
