import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private roteador = inject(Router);
  paginaAutenticacao = signal(this.ehPaginaAutenticacao(this.roteador.url));
  paginaInicial = signal(this.roteador.url === '/');

  constructor() {
    this.roteador.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(evento => {
        this.paginaAutenticacao.set(this.ehPaginaAutenticacao(evento.urlAfterRedirects));
        this.paginaInicial.set(evento.urlAfterRedirects === '/');
      });
  }

  private ehPaginaAutenticacao(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/esqueci') || url.startsWith('/cadastro');
  }
}
