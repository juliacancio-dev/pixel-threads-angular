import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CestaComponent } from './cesta.component';
import { USUARIO_DEMO, UsuarioService } from '../../services/usuario.service';

describe('CestaComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.usuarios');
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [CestaComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve mandar para o login ao finalizar a compra sem estar logado', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const itensAntes = componente.servicoCesta.itens().length;

    componente.finalizarCompra();

    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { voltar: '/cesta' } });
    expect(componente.servicoCesta.itens().length).toBe(itensAntes);
    expect(componente.pedidoConfirmado).toBeNull();
  });

  it('deve finalizar a compra e esvaziar a cesta quando estiver logado', () => {
    TestBed.inject(UsuarioService).entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const totalAntes = componente.total;

    componente.finalizarCompra();

    expect(navegar).not.toHaveBeenCalled();
    expect(componente.servicoCesta.itens().length).toBe(0);
    expect(componente.pedidoConfirmado?.total).toBe(totalAntes);
    expect(componente.pedidoConfirmado?.email).toBe(USUARIO_DEMO.email);
    expect(componente.pedidoConfirmado?.endereco).toEqual(USUARIO_DEMO.endereco);
  });

  it('deve ser criado', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });

  it('deve calcular frete grátis quando o subtotal for maior ou igual a 150', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;

    expect(componente.servicoCesta.subtotal()).toBeGreaterThanOrEqual(150);
    expect(componente.frete).toBe(0);
  });

  it('deve remover um item da cesta', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const totalAntes = componente.servicoCesta.itens().length;

    componente.removerItem(0);
    expect(componente.servicoCesta.itens().length).toBe(totalAntes - 1);
  });

  it('deve manter a quantidade dentro do intervalo de 1 a 10', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;

    componente.aoMudarQuantidade(0, 15);
    expect(componente.servicoCesta.itens()[0].quantidade).toBe(10);

    componente.aoMudarQuantidade(0, 0);
    expect(componente.servicoCesta.itens()[0].quantidade).toBe(1);
  });
});
