import { TestBed } from '@angular/core/testing';
import { CestaService } from './cesta.service';

describe('CestaService', () => {
  let service: CestaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CestaService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve iniciar com os itens mock e calcular os totais', () => {
    expect(service.itens().length).toBe(3);
    expect(service.totalItens()).toBe(4);
    expect(service.subtotal()).toBeCloseTo(79.9 + 89.9 * 2 + 74.9, 2);
  });

  it('deve somar a quantidade ao adicionar um item já existente (mesmo produto e tamanho)', () => {
    const totalAntes = service.totalItens();
    service.adicionarItem({
      produtoId: 1,
      nome: 'Camiseta Control Freak',
      imagem: 'assets/produtos/control-freak/foto-1.webp',
      tamanho: 'M',
      quantidade: 2,
      preco: 79.9
    });

    expect(service.itens().length).toBe(3);
    expect(service.totalItens()).toBe(totalAntes + 2);
  });

  it('deve adicionar um novo item quando o produto ou tamanho forem diferentes', () => {
    service.adicionarItem({
      produtoId: 2,
      nome: 'Camiseta Rick and Morty Peace Among Worlds',
      imagem: 'assets/produtos/rick-and-morty/foto-1.webp',
      tamanho: 'P',
      quantidade: 1,
      preco: 69.9
    });

    expect(service.itens().length).toBe(4);
  });

  it('deve remover um item pelo índice', () => {
    service.removerItem(0);
    expect(service.itens().length).toBe(2);
  });

  it('deve atualizar a quantidade de um item', () => {
    service.atualizarQuantidade(0, 5);
    expect(service.itens()[0].quantidade).toBe(5);
  });
});
