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
  private servicoProduto = inject(ProdutoService);
  private servicoCesta = inject(CestaService);
  private servicoToast = inject(ToastService);

  produtos: Produto[] = this.servicoProduto.listarProdutos();
  emailInformativo = '';
  informativoInvalido = false;

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

  assinarInformativo(formulario: any): void {
    if (formulario.valid) {
      this.servicoToast.mostrar('Inscrição confirmada! Fique de olho no seu e-mail.');
      this.emailInformativo = '';
      this.informativoInvalido = false;
      formulario.resetForm();
    } else {
      this.informativoInvalido = true;
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
