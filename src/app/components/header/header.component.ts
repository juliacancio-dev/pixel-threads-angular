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
  private router = inject(Router);
  private toastService = inject(ToastService);
  cestaService = inject(CestaService);
  usuarioService = inject(UsuarioService);

  menuAberto = false;
  termoBusca = '';
  paginaAuth = signal(this.ehPaginaAuth(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.paginaAuth.set(this.ehPaginaAuth(e.urlAfterRedirects)));
  }

  private ehPaginaAuth(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/esqueci') || url.startsWith('/cadastro');
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  sair(): void {
    this.usuarioService.sair();
    this.toastService.mostrar('Você saiu da sua conta.');
    this.router.navigate(['/']);
  }

  buscar(): void {
    this.router.navigate(['/busca'], { queryParams: { q: this.termoBusca || null } });
    this.menuAberto = false;
  }
}
