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
    const fixture = TestBed.createComponent(BuscaComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.resultados.length).toBe(component.todosProdutos.length);
  });

  it('deve filtrar produtos por termo de busca', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    const component = fixture.componentInstance;

    component.termoBusca = 'zeppelin';
    component.aplicarFiltros();
    expect(component.resultados.length).toBe(1);
  });

  it('deve filtrar produtos por categoria marcada', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    const component = fixture.componentInstance;

    component.categorias.find(c => c.nome === 'Games')!.marcado = true;
    component.aplicarFiltros();
    expect(component.resultados.every(p => p.categoria === 'Games')).toBeTrue();
  });

  it('deve filtrar produtos por tamanho infantil', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    const component = fixture.componentInstance;

    component.tamanhosInfantil.find(t => t.nome === '8')!.marcado = true;
    component.aplicarFiltros();
    expect(component.resultados.length).toBeGreaterThan(0);
    expect(component.resultados.every(p => p.categoria === 'Infantil')).toBeTrue();
  });

  it('deve limpar os filtros aplicados', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    const component = fixture.componentInstance;

    component.termoBusca = 'zeppelin';
    component.precoMaximo = 50;
    component.tamanhosAdulto[0].marcado = true;
    component.limparFiltros();

    expect(component.termoBusca).toBe('');
    expect(component.precoMaximo).toBe(150);
    expect(component.resultados.length).toBe(component.todosProdutos.length);
  });

  it('deve mostrar no máximo 8 produtos por página e navegar entre as páginas', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    spyOn(window, 'scrollTo');

    expect(component.totalPaginas).toBe(Math.ceil(component.resultados.length / 8));
    expect(component.resultadosDaPagina.length).toBe(8);

    component.irParaPagina(2);
    expect(component.paginaAtual).toBe(2);
    expect(component.resultadosDaPagina[0]).toBe(component.resultados[8]);
  });

  it('não deve sair do intervalo de páginas válidas', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.irParaPagina(0);
    component.irParaPagina(component.totalPaginas + 1);
    expect(component.paginaAtual).toBe(1);
  });

  it('deve voltar para a primeira página ao aplicar um filtro', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    spyOn(window, 'scrollTo');

    component.irParaPagina(2);
    component.termoBusca = 'camiseta';
    component.aplicarFiltros();
    expect(component.paginaAtual).toBe(1);
  });
});
