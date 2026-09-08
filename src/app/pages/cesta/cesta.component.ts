import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';

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

  cupom = '';

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
