import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  mostrarSenha = false;

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
      this.toastService.mostrar('Login realizado com sucesso!');
      this.form.reset({ email: '', senha: '', lembrar: false });
    } else {
      this.form.markAllAsTouched();
      this.toastService.mostrar('Confira os campos destacados em vermelho.');
    }
  }
}
