import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private mensagemSignal = signal<string>('');
  private visivelSignal = signal<boolean>(false);
  private timer: any;

  mensagem = this.mensagemSignal.asReadonly();
  visivel = this.visivelSignal.asReadonly();

  mostrar(mensagem: string): void {
    this.mensagemSignal.set(mensagem);
    this.visivelSignal.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.visivelSignal.set(false), 2600);
  }
}
