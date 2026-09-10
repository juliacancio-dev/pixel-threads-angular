import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { CestaService } from '../../services/cesta.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  cestaService = inject(CestaService);

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

  buscar(): void {
    this.router.navigate(['/busca'], { queryParams: { q: this.termoBusca || null } });
    this.menuAberto = false;
  }
}
