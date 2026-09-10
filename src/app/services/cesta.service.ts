import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CestaService {

  private itensSignal = signal<CartItem[]>([
    { produtoId: 1, nome: 'Camiseta Invaders 8-Bit', emoji: '👾', imagem: 'assets/produtos/camiseta-base.jpg', gradiente: 'radial-gradient(circle at 30% 30%,#3a2470,#1c1140)', tamanho: 'M', quantidade: 1, preco: 79.90 },
    { produtoId: 8, nome: 'Camiseta Retro Console', emoji: '🎮', imagem: 'assets/produtos/camiseta-base.jpg', gradiente: 'radial-gradient(circle at 55% 55%,#5c2a3d,#26101a)', tamanho: 'G', quantidade: 2, preco: 89.90 },
    { produtoId: 7, nome: 'Camiseta Alien Pixel', emoji: '👽', imagem: 'assets/produtos/camiseta-base.jpg', gradiente: 'radial-gradient(circle at 45% 35%,#3d2a5c,#181026)', tamanho: 'P', quantidade: 1, preco: 74.90 }
  ]);

  itens = this.itensSignal.asReadonly();

  totalItens = computed(() =>
    this.itensSignal().reduce((total, item) => total + item.quantidade, 0)
  );

  subtotal = computed(() =>
    this.itensSignal().reduce((total, item) => total + item.preco * item.quantidade, 0)
  );

  adicionarItem(item: CartItem): void {
    this.itensSignal.update(itens => {
      const existente = itens.find(i => i.produtoId === item.produtoId && i.tamanho === item.tamanho);
      if (existente) {
        return itens.map(i =>
          i === existente ? { ...i, quantidade: i.quantidade + item.quantidade } : i
        );
      }
      return [...itens, item];
    });
  }

  removerItem(index: number): void {
    this.itensSignal.update(itens => itens.filter((_, i) => i !== index));
  }

  atualizarQuantidade(index: number, quantidade: number): void {
    this.itensSignal.update(itens =>
      itens.map((item, i) => (i === index ? { ...item, quantidade } : item))
    );
  }
}
