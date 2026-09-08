import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProdutoComponent } from './produto.component';

describe('ProdutoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutoComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) }
        }
      ]
    }).compileComponents();
  });

  it('deve carregar o produto e os relacionados a partir do id da rota', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.produto?.id).toBe(1);
    expect(component.relacionados.length).toBe(4);
    expect(component.relacionados.some(p => p.id === 1)).toBeFalse();
  });

  it('não deve diminuir a quantidade abaixo de 1', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.quantidade = 1;
    component.diminuirQuantidade();
    expect(component.quantidade).toBe(1);
  });

  it('não deve aumentar a quantidade acima de 10', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.quantidade = 10;
    component.aumentarQuantidade();
    expect(component.quantidade).toBe(10);
  });

  it('deve trocar a aba ativa ao chamar selecionarAba()', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.selecionarAba('medidas');
    expect(component.abaAtiva).toBe('medidas');
  });
});
