import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { USUARIO_DEMO, UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private construtorFormulario = inject(FormBuilder);
  private roteador = inject(Router);
  private rota = inject(ActivatedRoute);
  private servicoToast = inject(ToastService);
  private servicoUsuario = inject(UsuarioService);

  readonly usuarioDemo = USUARIO_DEMO;
  mostrarSenha = false;
  credenciaisInvalidas = false;

  /** Página para onde voltar depois de entrar (ex.: a cesta, ao finalizar a compra). */
  readonly voltar = this.rotaSegura(this.rota.snapshot.queryParamMap.get('voltar'));

  private rotaSegura(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }

  formulario = this.construtorFormulario.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    lembrar: [false]
  });

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  enviar(): void {
    if (this.formulario.valid) {
      const { email, senha, lembrar } = this.formulario.getRawValue();
      if (!this.servicoUsuario.entrar(email!, senha!, !!lembrar)) {
        this.credenciaisInvalidas = true;
        this.servicoToast.mostrar('E-mail ou senha incorretos.');
        return;
      }
      this.credenciaisInvalidas = false;
      this.servicoToast.mostrar(`Olá, ${this.servicoUsuario.primeiroNome()}! Login realizado.`);
      this.formulario.reset({ email: '', senha: '', lembrar: false });
      this.roteador.navigateByUrl(this.voltar);
    } else {
      this.formulario.markAllAsTouched();
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
