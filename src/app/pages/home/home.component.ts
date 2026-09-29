import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto.service';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);
  private toastService = inject(ToastService);

  produtos: Produto[] = this.produtoService.getProdutos();
  emailNewsletter = '';
  newsletterInvalido = false;

  adicionarACesta(produto: Produto, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cestaService.adicionarItem({
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      tamanho: this.produtoService.getTamanhoPadrao(produto),
      quantidade: 1,
      preco: produto.preco
    });
    this.toastService.mostrar('Item adicionado à cesta ✓');
  }

  enviarNewsletter(form: any): void {
    if (form.valid) {
      this.toastService.mostrar('Inscrição confirmada! Fique de olho no seu e-mail.');
      this.emailNewsletter = '';
      this.newsletterInvalido = false;
      form.resetForm();
    } else {
      this.newsletterInvalido = true;
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
