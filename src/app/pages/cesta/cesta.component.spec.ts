import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CestaComponent } from './cesta.component';

describe('CestaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CestaComponent],
      providers: [provideRouter([])]
    }).compileComponents();
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
