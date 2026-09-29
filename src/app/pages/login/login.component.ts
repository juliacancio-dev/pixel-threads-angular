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
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);

  readonly usuarioDemo = USUARIO_DEMO;
  mostrarSenha = false;
  credenciaisInvalidas = false;

  /** Página para onde voltar depois de entrar (ex.: a cesta, ao finalizar a compra). */
  readonly voltar = this.rotaSegura(this.route.snapshot.queryParamMap.get('voltar'));

  private rotaSegura(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    lembrar: [false]
  });

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  enviar(): void {
    if (this.form.valid) {
      const { email, senha, lembrar } = this.form.getRawValue();
      if (!this.usuarioService.entrar(email!, senha!, !!lembrar)) {
        this.credenciaisInvalidas = true;
        this.toastService.mostrar('E-mail ou senha incorretos.');
        return;
      }
      this.credenciaisInvalidas = false;
      this.toastService.mostrar(`Olá, ${this.usuarioService.primeiroNome()}! Login realizado.`);
      this.form.reset({ email: '', senha: '', lembrar: false });
      this.router.navigateByUrl(this.voltar);
    } else {
      this.form.markAllAsTouched();
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
