import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ProdutoService } from './services/produto.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // Busca os produtos na API antes de mostrar o site.
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const servicoProduto = inject(ProdutoService);
        return () => servicoProduto.carregarProdutos();
      }
    }
  ]
};
