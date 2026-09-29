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
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  enviar(): void {
    if (this.form.valid) {
      if (!this.usuarioService.emailCadastrado(this.form.value.email!)) {
        this.toastService.mostrar('Não encontramos nenhuma conta com este e-mail.');
        return;
      }
      this.toastService.mostrar('Link de recuperação enviado! Confira seu e-mail.');
      this.form.reset({ email: '' });
    } else {
      this.form.markAllAsTouched();
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
