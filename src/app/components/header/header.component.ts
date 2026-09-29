import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { CestaService } from '../../services/cesta.service';
import { ToastService } from '../../services/toast.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private roteador = inject(Router);
  private servicoToast = inject(ToastService);
  servicoCesta = inject(CestaService);
  servicoUsuario = inject(UsuarioService);

  menuAberto = false;
  termoBusca = '';
  paginaAutenticacao = signal(this.ehPaginaAutenticacao(this.roteador.url));

  constructor() {
    this.roteador.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(evento => this.paginaAutenticacao.set(this.ehPaginaAutenticacao(evento.urlAfterRedirects)));
  }

  private ehPaginaAutenticacao(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/esqueci') || url.startsWith('/cadastro');
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  sair(): void {
    this.servicoUsuario.sair();
    this.servicoToast.mostrar('Você saiu da sua conta.');
    this.roteador.navigate(['/']);
  }

  buscar(): void {
    this.roteador.navigate(['/busca'], { queryParams: { q: this.termoBusca || null } });
    this.menuAberto = false;
  }
}
