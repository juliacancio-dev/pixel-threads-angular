import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Cupom } from '../models/pedido.model';
import { URL_API } from './produto.service';

/** Os cupons ficam no banco de dados, pela API (api/server.js). */
@Injectable({
  providedIn: 'root'
})
export class CupomService {
  private http = inject(HttpClient);

  /**
   * Pergunta à API se o cupom existe e está ativo.
   * Retorna null se for inválido. Se a API estiver fora do ar, a Promise falha.
   */
  async validar(codigo: string): Promise<Cupom | null> {
    try {
      return await firstValueFrom(this.http.post<Cupom>(`${URL_API}/cupons/validar`, { codigo: codigo.trim() }));
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 404) return null;
      throw erro;
    }
  }

  listar(): Promise<Cupom[]> {
    return firstValueFrom(this.http.get<Cupom[]>(`${URL_API}/cupons`));
  }

  /** Cria o cupom. Lança o HttpErrorResponse da API (400 dados inválidos, 409 código repetido). */
  criar(codigo: string, percentual: number): Promise<Cupom> {
    return firstValueFrom(this.http.post<Cupom>(`${URL_API}/cupons`, { codigo: codigo.trim(), percentual }));
  }

  alterar(codigo: string, dados: { percentual?: number; ativo?: boolean }): Promise<Cupom> {
    return firstValueFrom(this.http.put<Cupom>(`${URL_API}/cupons/${encodeURIComponent(codigo)}`, dados));
  }

  remover(codigo: string): Promise<void> {
    return firstValueFrom(this.http.delete(`${URL_API}/cupons/${encodeURIComponent(codigo)}`, { responseType: 'text' }))
      .then(() => undefined);
  }
}
