import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

interface PedidoConfirmado {
  numero: string;
  quantidadeItens: number;
  total: number;
  email: string;
}

@Component({
  selector: 'app-cesta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cesta.component.html',
  styleUrl: './cesta.component.css'
})
export class CestaComponent {
  cestaService = inject(CestaService);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  cupom = '';
  pedidoConfirmado: PedidoConfirmado | null = null;

  get frete(): number {
    return this.cestaService.subtotal() >= 150 ? 0 : 19.9;
  }

  get total(): number {
    return this.cestaService.subtotal() + this.frete;
  }

  diminuirQuantidade(index: number, quantidadeAtual: number): void {
    this.cestaService.atualizarQuantidade(index, Math.max(1, quantidadeAtual - 1));
  }

  aumentarQuantidade(index: number, quantidadeAtual: number): void {
    this.cestaService.atualizarQuantidade(index, Math.min(10, quantidadeAtual + 1));
  }

  onQuantidadeChange(index: number, valor: number): void {
    const quantidade = Math.min(10, Math.max(1, valor || 1));
    this.cestaService.atualizarQuantidade(index, quantidade);
  }

  removerItem(index: number): void {
    this.cestaService.removerItem(index);
    this.toastService.mostrar('Item removido da cesta.');
  }

  finalizarCompra(): void {
    const usuario = this.usuarioService.usuarioLogado();
    if (!usuario) {
      this.toastService.mostrar('Entre na sua conta para finalizar a compra.');
      this.router.navigate(['/login'], { queryParams: { voltar: '/cesta' } });
      return;
    }

    this.pedidoConfirmado = {
      numero: String(Math.floor(100000 + Math.random() * 900000)),
      quantidadeItens: this.cestaService.totalItens(),
      total: this.total,
      email: usuario.email
    };
    this.cestaService.limpar();
    this.toastService.mostrar('Pedido realizado com sucesso!');
  }

  aplicarCupom(form: any): void {
    if (this.cupom.trim()) {
      this.toastService.mostrar('Cupom aplicado com sucesso!');
      this.cupom = '';
      form.resetForm();
    } else {
      this.toastService.mostrar('Digite um cupom válido.');
    }
  }
}
