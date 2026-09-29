import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BuscaComponent } from './busca.component';

describe('BuscaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscaComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado e listar todos os produtos sem filtro', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    expect(componente).toBeTruthy();
    expect(componente.resultados.length).toBe(componente.todosProdutos.length);
  });

  it('deve filtrar produtos por termo de busca', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    const componente = montagem.componentInstance;

    componente.termoBusca = 'zeppelin';
    componente.aplicarFiltros();
    expect(componente.resultados.length).toBe(1);
  });

  it('deve filtrar produtos por categoria marcada', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    const componente = montagem.componentInstance;

    componente.categorias.find(c => c.nome === 'Games')!.marcado = true;
    componente.aplicarFiltros();
    expect(componente.resultados.every(p => p.categoria === 'Games')).toBeTrue();
  });

  it('deve filtrar produtos por tamanho infantil', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    const componente = montagem.componentInstance;

    componente.tamanhosInfantil.find(t => t.nome === '8')!.marcado = true;
    componente.aplicarFiltros();
    expect(componente.resultados.length).toBeGreaterThan(0);
    expect(componente.resultados.every(p => p.categoria === 'Infantil')).toBeTrue();
  });

  it('deve limpar os filtros aplicados', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    const componente = montagem.componentInstance;

    componente.termoBusca = 'zeppelin';
    componente.precoMaximo = 50;
    componente.tamanhosAdulto[0].marcado = true;
    componente.limparFiltros();

    expect(componente.termoBusca).toBe('');
    expect(componente.precoMaximo).toBe(150);
    expect(componente.resultados.length).toBe(componente.todosProdutos.length);
  });

  it('deve mostrar no máximo 8 produtos por página e navegar entre as páginas', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;
    spyOn(window, 'scrollTo');

    expect(componente.totalPaginas).toBe(Math.ceil(componente.resultados.length / 8));
    expect(componente.resultadosDaPagina.length).toBe(8);

    componente.irParaPagina(2);
    expect(componente.paginaAtual).toBe(2);
    expect(componente.resultadosDaPagina[0]).toBe(componente.resultados[8]);
  });

  it('não deve sair do intervalo de páginas válidas', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;

    componente.irParaPagina(0);
    componente.irParaPagina(componente.totalPaginas + 1);
    expect(componente.paginaAtual).toBe(1);
  });

  it('deve voltar para a primeira página ao aplicar um filtro', () => {
    const montagem = TestBed.createComponent(BuscaComponent);
    montagem.detectChanges();
    const componente = montagem.componentInstance;
    spyOn(window, 'scrollTo');

    componente.irParaPagina(2);
    componente.termoBusca = 'camiseta';
    componente.aplicarFiltros();
    expect(componente.paginaAtual).toBe(1);
  });
});
