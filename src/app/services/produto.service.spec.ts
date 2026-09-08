import { TestBed } from '@angular/core/testing';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutoService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve retornar todos os produtos', () => {
    expect(service.getProdutos().length).toBe(8);
  });

  it('deve retornar um produto pelo id', () => {
    const produto = service.getProdutoPorId(1);
    expect(produto?.nome).toBe('Camiseta Invaders 8-Bit');
  });

  it('deve retornar undefined para um id inexistente', () => {
    expect(service.getProdutoPorId(999)).toBeUndefined();
  });

  it('deve retornar produtos relacionados excluindo o produto atual', () => {
    const relacionados = service.getRelacionados(1, 4);
    expect(relacionados.length).toBe(4);
    expect(relacionados.some(p => p.id === 1)).toBeFalse();
  });

  it('deve buscar produtos por termo', () => {
    const resultado = service.buscar('matrix');
    expect(resultado.length).toBe(1);
    expect(resultado[0].nome).toContain('Matrix');
  });

  it('deve buscar produtos por categoria', () => {
    const resultado = service.buscar('', 'Games');
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every(p => p.categoria === 'Games')).toBeTrue();
  });

  it('deve combinar termo e categoria na busca', () => {
    const resultado = service.buscar('camiseta', 'Filmes');
    expect(resultado.length).toBe(1);
    expect(resultado[0].categoria).toBe('Filmes');
  });
});
