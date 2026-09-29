import { TestBed } from '@angular/core/testing';
import { CestaService } from './cesta.service';

describe('CestaService', () => {
  let servico: CestaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servico = TestBed.inject(CestaService);
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve iniciar com os itens mock e calcular os totais', () => {
    expect(servico.itens().length).toBe(3);
    expect(servico.totalItens()).toBe(4);
    expect(servico.subtotal()).toBeCloseTo(79.9 + 89.9 * 2 + 74.9, 2);
  });

  it('deve somar a quantidade ao adicionar um item já existente (mesmo produto e tamanho)', () => {
    const totalAntes = servico.totalItens();
    servico.adicionarItem({
      produtoId: 1,
      nome: 'Camiseta Control Freak',
      imagem: 'assets/produtos/control-freak/foto-1.webp',
      tamanho: 'M',
      quantidade: 2,
      preco: 79.9
    });

    expect(servico.itens().length).toBe(3);
    expect(servico.totalItens()).toBe(totalAntes + 2);
  });

  it('deve adicionar um novo item quando o produto ou tamanho forem diferentes', () => {
    servico.adicionarItem({
      produtoId: 2,
      nome: 'Camiseta Rick and Morty Peace Among Worlds',
      imagem: 'assets/produtos/rick-and-morty/foto-1.webp',
      tamanho: 'P',
      quantidade: 1,
      preco: 69.9
    });

    expect(servico.itens().length).toBe(4);
  });

  it('deve remover um item pelo índice', () => {
    servico.removerItem(0);
    expect(servico.itens().length).toBe(2);
  });

  it('deve atualizar a quantidade de um item', () => {
    servico.atualizarQuantidade(0, 5);
    expect(servico.itens()[0].quantidade).toBe(5);
  });
});
