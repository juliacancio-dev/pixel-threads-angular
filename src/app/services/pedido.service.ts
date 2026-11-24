import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ItemCesta } from '../models/item-cesta.model';
import { NovoPedido, Pedido } from '../models/pedido.model';
import { URL_API } from './produto.service';

/** Os pedidos ficam no banco de dados, pela API (api/server.js). */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);

  /** Grava o pedido do cliente com os itens da cesta. Se a API estiver fora do ar, a Promise falha. */
  criar(clienteId: number, itens: ItemCesta[], cupom?: string): Promise<Pedido> {
    const pedido: NovoPedido = {
      clienteId,
      itens: itens.map(i => ({ produtoId: i.produtoId, tamanho: i.tamanho, quantidade: i.quantidade })),
      ...(cupom ? { cupom } : {})
    };
    return firstValueFrom(this.http.post<Pedido>(`${URL_API}/pedidos`, pedido));
  }

  buscarPorCodigo(codigo: number): Promise<Pedido> {
    return firstValueFrom(this.http.get<Pedido>(`${URL_API}/pedidos/${codigo}`));
  }

  listarDoCliente(clienteId: number): Promise<Pedido[]> {
    return firstValueFrom(this.http.get<Pedido[]>(`${URL_API}/pedidos`, { params: { clienteId } }));
  }
}
