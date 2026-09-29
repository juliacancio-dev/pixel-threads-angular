import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const senha = control.get('senha')?.value;
  const confirmarSenha = control.get('confirmarSenha')?.value;
  return senha && confirmarSenha && senha !== confirmarSenha ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);

  mostrarSenha = false;
  mostrarConfirmarSenha = false;

  /** Página para onde voltar depois de entrar (ex.: a cesta, ao finalizar a compra). */
  readonly voltar = this.rotaSegura(this.route.snapshot.queryParamMap.get('voltar'));

  private rotaSegura(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
    aceiteTermos: [false, [Validators.requiredTrue]]
  }, { validators: senhasIguaisValidator });

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  enviar(): void {
    if (this.form.valid) {
      const { nome, email, senha } = this.form.getRawValue();
      if (!this.usuarioService.cadastrar(nome!, email!, senha!)) {
        this.form.controls.email.setErrors({ emailEmUso: true });
        this.form.controls.email.markAsTouched();
        this.toastService.mostrar('Este e-mail já está cadastrado.');
        return;
      }
      this.toastService.mostrar(`Conta criada! Olá, ${this.usuarioService.primeiroNome()}.`);
      this.form.reset({ nome: '', email: '', senha: '', confirmarSenha: '', aceiteTermos: false });
      this.router.navigateByUrl(this.voltar);
    } else {
      this.form.markAllAsTouched();
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
