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
  private router = inject(Router);
  paginaAuth = signal(this.ehPaginaAuth(this.router.url));
  paginaInicial = signal(this.router.url === '/');

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.paginaAuth.set(this.ehPaginaAuth(e.urlAfterRedirects));
        this.paginaInicial.set(e.urlAfterRedirects === '/');
      });
  }

  private ehPaginaAuth(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/esqueci');
  }
}
