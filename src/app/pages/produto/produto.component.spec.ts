import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProdutoComponent } from './produto.component';
import { ProdutoService } from '../../services/produto.service';
import { CestaService } from '../../services/cesta.service';

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

  it('deve adicionar o produto à cesta e ir para a cesta ao clicar em Comprar agora', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const cesta = TestBed.inject(CestaService);
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const totalAntes = cesta.totalItens();

    component.quantidade = 2;
    component.comprarAgora();

    expect(cesta.totalItens()).toBe(totalAntes + 2);
    expect(navegar).toHaveBeenCalledWith(['/cesta']);
  });

  it('não deve ir para a cesta em Comprar agora sem tamanho selecionado', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');

    component.tamanhoSelecionado = '';
    component.comprarAgora();

    expect(component.tamanhoInvalido).toBeTrue();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve trocar a foto principal ao clicar numa miniatura da galeria', () => {
    const fixture = TestBed.createComponent(ProdutoComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.produto = TestBed.inject(ProdutoService).getProdutoPorId(2);
    component.selecionarFoto(1);
    fixture.detectChanges();

    const fotoPrincipal: HTMLImageElement = fixture.nativeElement.querySelector('.gallery-main img');
    expect(component.fotos.length).toBe(3);
    expect(fotoPrincipal.getAttribute('src')).toBe(component.fotos[1]);
  });
});
