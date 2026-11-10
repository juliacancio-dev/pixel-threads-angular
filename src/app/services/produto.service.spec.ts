import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProdutoService, URL_API } from './produto.service';
import { CATALOGO } from './catalogo';

describe('ProdutoService', () => {
  let servico: ProdutoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servico = TestBed.inject(ProdutoService);
    servico.definirProdutos(CATALOGO);
  });

  it('deve buscar os produtos na API ao carregar', async () => {
    const http = TestBed.inject(HttpTestingController);
    const carregando = servico.carregarProdutos();

    http.expectOne(`${URL_API}/produtos`).flush([CATALOGO[0], CATALOGO[1]]);
    await carregando;

    expect(servico.listarProdutos().length).toBe(2);
    expect(servico.erroAoCarregar).toBeFalse();
    http.verify();
  });

  it('deve ficar sem produtos e marcar erro quando a API está fora do ar', async () => {
    const http = TestBed.inject(HttpTestingController);
    spyOn(console, 'error');
    const carregando = servico.carregarProdutos();

    http.expectOne(`${URL_API}/produtos`).error(new ProgressEvent('error'));
    await carregando;

    expect(servico.listarProdutos().length).toBe(0);
    expect(servico.erroAoCarregar).toBeTrue();
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve retornar todos os produtos', () => {
    expect(servico.listarProdutos().length).toBe(17);
  });

  it('deve retornar um produto pelo id', () => {
    const produto = servico.obterProdutoPorId(1);
    expect(produto?.nome).toBe('Camiseta Control Freak');
  });

  it('deve retornar undefined para um id inexistente', () => {
    expect(servico.obterProdutoPorId(999)).toBeUndefined();
  });

  it('deve retornar produtos relacionados excluindo o produto atual', () => {
    const relacionados = servico.obterRelacionados(1, 4);
    expect(relacionados.length).toBe(4);
    expect(relacionados.some(p => p.id === 1)).toBeFalse();
  });

  it('deve usar tamanhos por idade nas camisetas infantis e P a GG nas adultas', () => {
    const produtos = servico.listarProdutos();
    const infantis = produtos.filter(p => p.categoria === 'Infantil');
    const adultas = produtos.filter(p => p.categoria !== 'Infantil');

    expect(infantis.length).toBeGreaterThan(0);
    expect(infantis.every(p => !p.tamanhos.includes('M'))).toBeTrue();
    expect(infantis.every(p => p.tamanhos.includes('6'))).toBeTrue();
    expect(adultas.every(p => p.tamanhos.join() === 'P,M,G,GG')).toBeTrue();
  });

  it('deve sugerir um tamanho padrão que exista no produto', () => {
    const adulta = servico.obterProdutoPorId(1)!;
    const infantil = servico.listarProdutos().find(p => p.categoria === 'Infantil')!;

    expect(servico.obterTamanhoPadrao(adulta)).toBe('M');
    expect(servico.obterTamanhoPadrao(infantil)).toBe('6');
  });

  it('deve buscar produtos por termo', () => {
    const resultado = servico.buscar('zeppelin');
    expect(resultado.length).toBe(1);
    expect(resultado[0].nome).toContain('Zeppelin');
  });

  it('deve buscar produtos por categoria', () => {
    const resultado = servico.buscar('', 'Games');
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every(p => p.categoria === 'Games')).toBeTrue();
  });

  it('deve combinar termo e categoria na busca', () => {
    const resultado = servico.buscar('rick', 'Filmes');
    expect(resultado.length).toBe(1);
    expect(resultado[0].categoria).toBe('Filmes');
  });
});
