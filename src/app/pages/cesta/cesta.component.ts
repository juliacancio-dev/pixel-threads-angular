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
  servicoCesta = inject(CestaService);
  private servicoToast = inject(ToastService);
  private servicoUsuario = inject(UsuarioService);
  private roteador = inject(Router);

  cupom = '';
  pedidoConfirmado: PedidoConfirmado | null = null;

  get frete(): number {
    return this.servicoCesta.subtotal() >= 150 ? 0 : 19.9;
  }

  get total(): number {
    return this.servicoCesta.subtotal() + this.frete;
  }

  diminuirQuantidade(indice: number, quantidadeAtual: number): void {
    this.servicoCesta.atualizarQuantidade(indice, Math.max(1, quantidadeAtual - 1));
  }

  aumentarQuantidade(indice: number, quantidadeAtual: number): void {
    this.servicoCesta.atualizarQuantidade(indice, Math.min(10, quantidadeAtual + 1));
  }

  aoMudarQuantidade(indice: number, valor: number): void {
    const quantidade = Math.min(10, Math.max(1, valor || 1));
    this.servicoCesta.atualizarQuantidade(indice, quantidade);
  }

  removerItem(indice: number): void {
    this.servicoCesta.removerItem(indice);
    this.servicoToast.mostrar('Item removido da cesta.');
  }

  finalizarCompra(): void {
    const usuario = this.servicoUsuario.usuarioLogado();
    if (!usuario) {
      this.servicoToast.mostrar('Entre na sua conta para finalizar a compra.');
      this.roteador.navigate(['/login'], { queryParams: { voltar: '/cesta' } });
      return;
    }

    this.pedidoConfirmado = {
      numero: String(Math.floor(100000 + Math.random() * 900000)),
      quantidadeItens: this.servicoCesta.totalItens(),
      total: this.total,
      email: usuario.email
    };
    this.servicoCesta.limpar();
    this.servicoToast.mostrar('Pedido realizado com sucesso!');
  }

  aplicarCupom(formulario: any): void {
    if (this.cupom.trim()) {
      this.servicoToast.mostrar('Cupom aplicado com sucesso!');
      this.cupom = '';
      formulario.resetForm();
    } else {
      this.servicoToast.mostrar('Digite um cupom válido.');
    }
  }
}
