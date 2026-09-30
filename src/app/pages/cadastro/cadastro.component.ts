import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Endereco } from '../../models/usuario.model';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

export const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

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

  readonly estados = ESTADOS;
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
    endereco: this.construtorFormulario.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      rua: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]]
    }),
    aceiteTermos: [false, [Validators.requiredTrue]]
  }, { validators: validarSenhasIguais });

  /** Campo inválido e já tocado pelo usuário, ex.: campoInvalido('endereco.cep'). */
  campoInvalido(caminho: string): boolean {
    const campo = this.formulario.get(caminho);
    return !!campo && campo.invalid && campo.touched;
  }

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  alternarConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  enviar(): void {
    if (this.formulario.valid) {
      const { nome, email, senha, endereco } = this.formulario.getRawValue();
      if (!this.servicoUsuario.cadastrar(nome!, email!, senha!, endereco as Endereco)) {
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
