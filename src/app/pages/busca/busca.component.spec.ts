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

    component.termoBusca = 'matrix';
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

  it('deve limpar os filtros aplicados', () => {
    const fixture = TestBed.createComponent(BuscaComponent);
    const component = fixture.componentInstance;

    component.termoBusca = 'matrix';
    component.precoMaximo = 50;
    component.limparFiltros();

    expect(component.termoBusca).toBe('');
    expect(component.precoMaximo).toBe(150);
    expect(component.resultados.length).toBe(component.todosProdutos.length);
  });
});
