import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private mensagemSinal = signal<string>('');
  private visivelSinal = signal<boolean>(false);
  private temporizador: any;

  mensagem = this.mensagemSinal.asReadonly();
  visivel = this.visivelSinal.asReadonly();

  mostrar(mensagem: string): void {
    this.mensagemSinal.set(mensagem);
    this.visivelSinal.set(true);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.visivelSinal.set(false), 2600);
  }
}
