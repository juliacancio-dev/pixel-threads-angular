import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Endereco } from '../../models/usuario.model';
import { CestaService } from '../../services/cesta.service';
import { Cupom } from '../../models/pedido.model';
import { CupomService } from '../../services/cupom.service';
import { PedidoService } from '../../services/pedido.service';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

interface PedidoConfirmado {
  numero: string;
  quantidadeItens: number;
  total: number;
  email: string;
  endereco?: Endereco;
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
  private servicoPedido = inject(PedidoService);
  private servicoCupom = inject(CupomService);
  private roteador = inject(Router);

  cupom = '';
  cupomAplicado: Cupom | null = null;
  validandoCupom = false;
  pedidoConfirmado: PedidoConfirmado | null = null;
  enviandoPedido = false;

  get frete(): number {
    return this.servicoCesta.subtotal() >= 150 ? 0 : 19.9;
  }

  /** Mesma conta da API: arredonda em centavos e o desconto vale só para os produtos, não para o frete. */
  get desconto(): number {
    if (!this.cupomAplicado) return 0;
    const subtotal = Math.round(this.servicoCesta.subtotal() * 100) / 100;
    return Math.round(subtotal * this.cupomAplicado.percentual) / 100;
  }

  get total(): number {
    return Math.round((this.servicoCesta.subtotal() - this.desconto + this.frete) * 100) / 100;
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

  async finalizarCompra(): Promise<void> {
    if (this.enviandoPedido) return;

    const usuario = this.servicoUsuario.usuarioLogado();
    // Sessões antigas não guardavam o id do cliente: pede para entrar de novo.
    if (!usuario || usuario.id === undefined) {
      this.servicoToast.mostrar('Entre na sua conta para finalizar a compra.');
      this.roteador.navigate(['/login'], { queryParams: { voltar: '/cesta' } });
      return;
    }

    this.enviandoPedido = true;
    try {
      const pedido = await this.servicoPedido.criar(usuario.id, this.servicoCesta.itens(), this.cupomAplicado?.codigo);
      this.pedidoConfirmado = {
        numero: String(pedido.codigoPedido),
        quantidadeItens: pedido.itens.reduce((soma, item) => soma + item.quantidade, 0),
        total: pedido.total,
        email: usuario.email,
        endereco: pedido.enderecoEntrega ?? usuario.endereco
      };
      this.servicoCesta.limpar();
      this.cupomAplicado = null;
      this.servicoToast.mostrar('Pedido realizado com sucesso!');
    } catch (erro) {
      console.error('Não foi possível gravar o pedido.', erro);
      const recusado = erro instanceof HttpErrorResponse && erro.status === 400;
      this.servicoToast.mostrar(recusado
        ? 'Não foi possível finalizar: confira os itens e o cupom da cesta.'
        : 'Não foi possível finalizar a compra agora. A API está rodando?');
    } finally {
      this.enviandoPedido = false;
    }
  }

  async aplicarCupom(formulario: any): Promise<void> {
    const codigo = this.cupom.trim();
    if (!codigo) {
      this.servicoToast.mostrar('Digite um cupom válido.');
      return;
    }
    if (this.cupomAplicado) {
      this.servicoToast.mostrar('Já tem um cupom aplicado. Remova-o para usar outro.');
      return;
    }

    this.validandoCupom = true;
    try {
      const cupom = await this.servicoCupom.validar(codigo);
      if (cupom) {
        this.cupomAplicado = cupom;
        this.cupom = '';
        formulario.resetForm();
        this.servicoToast.mostrar(`Cupom ${cupom.codigo} aplicado: ${cupom.percentual}% de desconto!`);
      } else {
        this.servicoToast.mostrar('Cupom inválido ou expirado.');
      }
    } catch (erro) {
      console.error('Não foi possível validar o cupom.', erro);
      this.servicoToast.mostrar('Não foi possível validar o cupom agora. A API está rodando?');
    } finally {
      this.validandoCupom = false;
    }
  }

  removerCupom(): void {
    this.cupomAplicado = null;
    this.servicoToast.mostrar('Cupom removido.');
  }
}
