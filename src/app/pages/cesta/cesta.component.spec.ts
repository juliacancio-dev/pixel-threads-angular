import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CestaComponent } from './cesta.component';
import { USUARIO_DEMO, UsuarioService } from '../../services/usuario.service';
import { URL_API } from '../../services/produto.service';

describe('CestaComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [CestaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('deve mandar para o login ao finalizar a compra sem estar logado', async () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const itensAntes = componente.servicoCesta.itens().length;

    await componente.finalizarCompra();

    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { voltar: '/cesta' } });
    expect(componente.servicoCesta.itens().length).toBe(itensAntes);
    expect(componente.pedidoConfirmado).toBeNull();
  });

  async function entrarComoDemo(): Promise<void> {
    const login = TestBed.inject(UsuarioService).entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/login`)
      .flush({ id: 1, nome: USUARIO_DEMO.nome, email: USUARIO_DEMO.email, endereco: USUARIO_DEMO.endereco });
    await login;
  }

  it('deve gravar o pedido na API, mostrar o código dele e esvaziar a cesta', async () => {
    await entrarComoDemo();
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const itens = componente.servicoCesta.itens();
    const totalAntes = componente.total;

    const finalizando = componente.finalizarCompra();
    const requisicao = TestBed.inject(HttpTestingController).expectOne(`${URL_API}/pedidos`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({
      clienteId: 1,
      itens: itens.map(i => ({ produtoId: i.produtoId, tamanho: i.tamanho, quantidade: i.quantidade }))
    });
    requisicao.flush({
      codigoPedido: 42, clienteId: 1, data: '2026-01-01T00:00:00.000Z', status: 'recebido',
      subtotal: totalAntes, frete: 0, total: totalAntes, enderecoEntrega: USUARIO_DEMO.endereco,
      itens: itens.map(i => ({ ...i }))
    });
    await finalizando;

    expect(navegar).not.toHaveBeenCalled();
    expect(componente.servicoCesta.itens().length).toBe(0);
    expect(componente.pedidoConfirmado?.numero).toBe('42');
    expect(componente.pedidoConfirmado?.total).toBe(totalAntes);
    expect(componente.pedidoConfirmado?.email).toBe(USUARIO_DEMO.email);
    expect(componente.pedidoConfirmado?.endereco).toEqual(USUARIO_DEMO.endereco);
  });

  it('deve manter a cesta e não confirmar o pedido se a API falhar', async () => {
    await entrarComoDemo();
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const itensAntes = componente.servicoCesta.itens().length;
    spyOn(console, 'error');

    const finalizando = componente.finalizarCompra();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/pedidos`)
      .flush({ erro: 'fora do ar' }, { status: 500, statusText: 'Server Error' });
    await finalizando;

    expect(componente.pedidoConfirmado).toBeNull();
    expect(componente.servicoCesta.itens().length).toBe(itensAntes);
    expect(componente.enviandoPedido).toBeFalse();
  });

  describe('cupom', () => {
    const formulario = { resetForm: () => {} };

    it('deve aplicar um cupom válido e descontar só dos produtos, sem mexer no frete', async () => {
      const componente = TestBed.createComponent(CestaComponent).componentInstance;
      const subtotal = componente.servicoCesta.subtotal();
      const totalSemCupom = componente.total;
      componente.cupom = 'pixel10';

      const aplicando = componente.aplicarCupom(formulario);
      const requisicao = TestBed.inject(HttpTestingController).expectOne(`${URL_API}/cupons/validar`);
      expect(requisicao.request.body).toEqual({ codigo: 'pixel10' });
      requisicao.flush({ codigo: 'PIXEL10', percentual: 10 });
      await aplicando;

      expect(componente.cupomAplicado).toEqual({ codigo: 'PIXEL10', percentual: 10 });
      expect(componente.desconto).toBeCloseTo(subtotal * 0.1, 2);
      expect(componente.frete).toBe(0);
      expect(componente.total).toBeCloseTo(totalSemCupom - subtotal * 0.1, 2);
      expect(componente.cupom).toBe('');
    });

    it('deve recusar cupom inválido e manter o total', async () => {
      const componente = TestBed.createComponent(CestaComponent).componentInstance;
      const totalAntes = componente.total;
      componente.cupom = 'NAOEXISTE';

      const aplicando = componente.aplicarCupom(formulario);
      TestBed.inject(HttpTestingController).expectOne(`${URL_API}/cupons/validar`)
        .flush({ erro: 'Cupom inválido ou expirado' }, { status: 404, statusText: 'Not Found' });
      await aplicando;

      expect(componente.cupomAplicado).toBeNull();
      expect(componente.desconto).toBe(0);
      expect(componente.total).toBe(totalAntes);
    });

    it('não deve chamar a API com o campo vazio', async () => {
      const componente = TestBed.createComponent(CestaComponent).componentInstance;
      componente.cupom = '   ';

      await componente.aplicarCupom(formulario);

      TestBed.inject(HttpTestingController).expectNone(`${URL_API}/cupons/validar`);
      expect(componente.cupomAplicado).toBeNull();
    });

    it('deve remover o cupom aplicado', () => {
      const componente = TestBed.createComponent(CestaComponent).componentInstance;
      const totalSemCupom = componente.total;
      componente.cupomAplicado = { codigo: 'PIXEL10', percentual: 10 };

      componente.removerCupom();

      expect(componente.cupomAplicado).toBeNull();
      expect(componente.total).toBe(totalSemCupom);
    });

    it('deve mandar o cupom junto com o pedido e mostrar o total com desconto da API', async () => {
      await entrarComoDemo();
      const componente = TestBed.createComponent(CestaComponent).componentInstance;
      componente.cupomAplicado = { codigo: 'PIXEL10', percentual: 10 };
      const itens = componente.servicoCesta.itens();
      const totalComDesconto = componente.total;

      const finalizando = componente.finalizarCompra();
      const requisicao = TestBed.inject(HttpTestingController).expectOne(`${URL_API}/pedidos`);
      expect(requisicao.request.body.cupom).toBe('PIXEL10');
      requisicao.flush({
        codigoPedido: 7, clienteId: 1, data: '2026-01-01T00:00:00.000Z', status: 'recebido',
        subtotal: 344.6, frete: 0, cupom: 'PIXEL10', desconto: 34.46, total: totalComDesconto,
        enderecoEntrega: USUARIO_DEMO.endereco, itens: itens.map(i => ({ ...i }))
      });
      await finalizando;

      expect(componente.pedidoConfirmado?.total).toBeCloseTo(310.14, 2);
      expect(componente.cupomAplicado).toBeNull();
    });
  });

  it('deve ser criado', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });

  it('deve calcular frete grátis quando o subtotal for maior ou igual a 150', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;

    expect(componente.servicoCesta.subtotal()).toBeGreaterThanOrEqual(150);
    expect(componente.frete).toBe(0);
  });

  it('deve remover um item da cesta', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;
    const totalAntes = componente.servicoCesta.itens().length;

    componente.removerItem(0);
    expect(componente.servicoCesta.itens().length).toBe(totalAntes - 1);
  });

  it('deve manter a quantidade dentro do intervalo de 1 a 10', () => {
    const montagem = TestBed.createComponent(CestaComponent);
    const componente = montagem.componentInstance;

    componente.aoMudarQuantidade(0, 15);
    expect(componente.servicoCesta.itens()[0].quantidade).toBe(10);

    componente.aoMudarQuantidade(0, 0);
    expect(componente.servicoCesta.itens()[0].quantidade).toBe(1);
  });
});
