import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-esqueci',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './esqueci.component.html',
  styleUrl: './esqueci.component.css'
})
export class EsqueciComponent {
  private construtorFormulario = inject(FormBuilder);
  private servicoToast = inject(ToastService);
  private servicoUsuario = inject(UsuarioService);

  formulario = this.construtorFormulario.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async enviar(): Promise<void> {
    if (this.formulario.valid) {
      let existe: boolean;
      try {
        existe = await this.servicoUsuario.emailCadastrado(this.formulario.value.email!);
      } catch {
        this.servicoToast.mostrar('Não foi possível falar com o servidor. Tente de novo em instantes.');
        return;
      }
      if (!existe) {
        this.servicoToast.mostrar('Não encontramos nenhuma conta com este e-mail.');
        return;
      }
      this.servicoToast.mostrar('Link de recuperação enviado! Confira seu e-mail.');
      this.formulario.reset({ email: '' });
    } else {
      this.formulario.markAllAsTouched();
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
