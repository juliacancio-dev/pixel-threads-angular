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
    const fixture = TestBed.createComponent(CestaComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const itensAntes = component.cestaService.itens().length;

    component.finalizarCompra();

    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { voltar: '/cesta' } });
    expect(component.cestaService.itens().length).toBe(itensAntes);
    expect(component.pedidoConfirmado).toBeNull();
  });

  it('deve finalizar a compra e esvaziar a cesta quando estiver logado', () => {
    TestBed.inject(UsuarioService).entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    const fixture = TestBed.createComponent(CestaComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const totalAntes = component.total;

    component.finalizarCompra();

    expect(navegar).not.toHaveBeenCalled();
    expect(component.cestaService.itens().length).toBe(0);
    expect(component.pedidoConfirmado?.total).toBe(totalAntes);
    expect(component.pedidoConfirmado?.email).toBe(USUARIO_DEMO.email);
  });

  it('deve ser criado', () => {
    const fixture = TestBed.createComponent(CestaComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve calcular frete grátis quando o subtotal for maior ou igual a 150', () => {
    const fixture = TestBed.createComponent(CestaComponent);
    const component = fixture.componentInstance;

    expect(component.cestaService.subtotal()).toBeGreaterThanOrEqual(150);
    expect(component.frete).toBe(0);
  });

  it('deve remover um item da cesta', () => {
    const fixture = TestBed.createComponent(CestaComponent);
    const component = fixture.componentInstance;
    const totalAntes = component.cestaService.itens().length;

    component.removerItem(0);
    expect(component.cestaService.itens().length).toBe(totalAntes - 1);
  });

  it('deve manter a quantidade dentro do intervalo de 1 a 10', () => {
    const fixture = TestBed.createComponent(CestaComponent);
    const component = fixture.componentInstance;

    component.onQuantidadeChange(0, 15);
    expect(component.cestaService.itens()[0].quantidade).toBe(10);

    component.onQuantidadeChange(0, 0);
    expect(component.cestaService.itens()[0].quantidade).toBe(1);
  });
});
