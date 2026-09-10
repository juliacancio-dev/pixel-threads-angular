import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BuscaComponent } from './pages/busca/busca.component';
import { ProdutoComponent } from './pages/produto/produto.component';
import { CestaComponent } from './pages/cesta/cesta.component';
import { LoginComponent } from './pages/login/login.component';
import { EsqueciComponent } from './pages/esqueci/esqueci.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'PIXEL THREADS — Camisetas e produtos geek' },
  { path: 'busca', component: BuscaComponent, title: 'Buscar produtos — PIXEL THREADS' },
  { path: 'produto/:id', component: ProdutoComponent, title: 'Produto — PIXEL THREADS' },
  { path: 'cesta', component: CestaComponent, title: 'Minha cesta — PIXEL THREADS' },
  { path: 'login', component: LoginComponent, title: 'Entrar — PIXEL THREADS' },
  { path: 'cadastro', component: CadastroComponent, title: 'Criar conta — PIXEL THREADS' },
  { path: 'esqueci', component: EsqueciComponent, title: 'Esqueci minha senha — PIXEL THREADS' },
  { path: '**', redirectTo: '' }
];
