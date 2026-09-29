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
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    expect(componente.produto?.id).toBe(1);
    expect(componente.relacionados.length).toBe(4);
    expect(componente.relacionados.some(p => p.id === 1)).toBeFalse();
  });

  it('não deve diminuir a quantidade abaixo de 1', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    componente.quantidade = 1;
    componente.diminuirQuantidade();
    expect(componente.quantidade).toBe(1);
  });

  it('não deve aumentar a quantidade acima de 10', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    componente.quantidade = 10;
    componente.aumentarQuantidade();
    expect(componente.quantidade).toBe(10);
  });

  it('deve trocar a aba ativa ao chamar selecionarAba()', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    componente.selecionarAba('medidas');
    expect(componente.abaAtiva).toBe('medidas');
  });

  it('deve adicionar o produto à cesta e ir para a cesta ao clicar em Comprar agora', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;
    const cesta = TestBed.inject(CestaService);
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const totalAntes = cesta.totalItens();

    componente.quantidade = 2;
    componente.comprarAgora();

    expect(cesta.totalItens()).toBe(totalAntes + 2);
    expect(navegar).toHaveBeenCalledWith(['/cesta']);
  });

  it('não deve ir para a cesta em Comprar agora sem tamanho selecionado', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');

    componente.tamanhoSelecionado = '';
    componente.comprarAgora();

    expect(componente.tamanhoInvalido).toBeTrue();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve trocar a foto principal ao clicar numa miniatura da galeria', () => {
    const montagem = TestBed.createComponent(ProdutoComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    componente.produto = TestBed.inject(ProdutoService).obterProdutoPorId(2);
    componente.selecionarFoto(1);
    montagem.detectChanges();

    const fotoPrincipal: HTMLImageElement = montagem.nativeElement.querySelector('.gallery-main img');
    expect(componente.fotos.length).toBe(3);
    expect(fotoPrincipal.getAttribute('src')).toBe(componente.fotos[1]);
  });
});
