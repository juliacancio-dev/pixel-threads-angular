import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

function validarSenhasIguais(controle: AbstractControl): ValidationErrors | null {
  const senha = controle.get('senha')?.value;
  const confirmarSenha = controle.get('confirmarSenha')?.value;
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
  private construtorFormulario = inject(FormBuilder);
  private roteador = inject(Router);
  private rota = inject(ActivatedRoute);
  private servicoToast = inject(ToastService);
  private servicoUsuario = inject(UsuarioService);

  mostrarSenha = false;
  mostrarConfirmarSenha = false;

  /** Página para onde voltar depois de entrar (ex.: a cesta, ao finalizar a compra). */
  readonly voltar = this.rotaSegura(this.rota.snapshot.queryParamMap.get('voltar'));

  private rotaSegura(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }

  formulario = this.construtorFormulario.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
    aceiteTermos: [false, [Validators.requiredTrue]]
  }, { validators: validarSenhasIguais });

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  alternarConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  enviar(): void {
    if (this.formulario.valid) {
      const { nome, email, senha } = this.formulario.getRawValue();
      if (!this.servicoUsuario.cadastrar(nome!, email!, senha!)) {
        this.formulario.controls.email.setErrors({ emailEmUso: true });
        this.formulario.controls.email.markAsTouched();
        this.servicoToast.mostrar('Este e-mail já está cadastrado.');
        return;
      }
      this.servicoToast.mostrar(`Conta criada! Olá, ${this.servicoUsuario.primeiroNome()}.`);
      this.formulario.reset({ nome: '', email: '', senha: '', confirmarSenha: '', aceiteTermos: false });
      this.roteador.navigateByUrl(this.voltar);
    } else {
      this.formulario.markAllAsTouched();
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
