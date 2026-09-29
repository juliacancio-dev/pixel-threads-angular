import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CestaService {

  private itensSignal = signal<CartItem[]>([
    { produtoId: 1, nome: 'Camiseta Control Freak', imagem: 'assets/produtos/control-freak/foto-1.webp', tamanho: 'M', quantidade: 1, preco: 79.90 },
    { produtoId: 6, nome: 'Camiseta Dragon Ball Z Shenlong', imagem: 'assets/produtos/dragon-ball-shenlong/foto-1.webp', tamanho: 'G', quantidade: 2, preco: 89.90 },
    { produtoId: 12, nome: 'Camiseta Os Mestres', imagem: 'assets/produtos/os-mestres/foto-1.webp', tamanho: 'P', quantidade: 1, preco: 74.90 }
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

  limpar(): void {
    this.itensSignal.set([]);
  }

  atualizarQuantidade(index: number, quantidade: number): void {
    this.itensSignal.update(itens =>
      itens.map((item, i) => (i === index ? { ...item, quantidade } : item))
    );
  }
}
