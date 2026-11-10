import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { USUARIO_DEMO, UsuarioService } from './usuario.service';
import { URL_API } from './produto.service';

/** O que a API devolve para o cliente demo (sem a senha). */
const CLIENTE_DEMO = { id: 1, nome: USUARIO_DEMO.nome, email: USUARIO_DEMO.email, endereco: USUARIO_DEMO.endereco };

describe('UsuarioService', () => {
  let servico: UsuarioService;
  let http: HttpTestingController;

  function configurar(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servico = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    configurar();
  });

  afterEach(() => http.verify());

  it('deve começar sem ninguém logado', () => {
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve apagar os cadastros antigos que ficavam salvos no navegador', () => {
    localStorage.setItem('pixelthreads.usuarios', JSON.stringify([USUARIO_DEMO]));
    TestBed.resetTestingModule();
    configurar();

    expect(localStorage.getItem('pixelthreads.usuarios')).toBeNull();
  });

  it('deve perguntar à API se o e-mail está cadastrado', async () => {
    const resposta = servico.emailCadastrado(' Cliente@PixelThreads.com ');

    const requisicao = http.expectOne(`${URL_API}/clientes/existe`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({ email: 'cliente@pixelthreads.com' });
    requisicao.flush({ existe: true });

    expect(await resposta).toBeTrue();
  });

  it('deve cadastrar o cliente na API e deixá-lo logado', async () => {
    const resposta = servico.cadastrar('Maria Souza ', 'Maria@Teste.com ', 'segredo', USUARIO_DEMO.endereco);

    const requisicao = http.expectOne(`${URL_API}/clientes`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({
      nome: 'Maria Souza', email: 'maria@teste.com', senha: 'segredo', endereco: USUARIO_DEMO.endereco
    });
    requisicao.flush({ id: 7, nome: 'Maria Souza', email: 'maria@teste.com', endereco: USUARIO_DEMO.endereco });

    expect(await resposta).toBeTrue();
    expect(servico.primeiroNome()).toBe('Maria');
    expect(servico.usuarioLogado()?.id).toBe(7);
  });

  it('não deve cadastrar quando a API diz que o e-mail já existe', async () => {
    const resposta = servico.cadastrar('Outra Maria', 'maria@teste.com', 'outra1');

    http.expectOne(`${URL_API}/clientes`).flush({ erro: 'E-mail já cadastrado' }, { status: 409, statusText: 'Conflict' });

    expect(await resposta).toBeFalse();
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve entrar quando a API confirma e-mail e senha', async () => {
    const resposta = servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);

    const requisicao = http.expectOne(`${URL_API}/login`);
    expect(requisicao.request.body).toEqual({ email: USUARIO_DEMO.email, senha: USUARIO_DEMO.senha });
    requisicao.flush(CLIENTE_DEMO);

    expect(await resposta).toBeTrue();
    expect(servico.usuarioLogado()?.email).toBe(USUARIO_DEMO.email);
    expect(servico.usuarioLogado()).not.toEqual(jasmine.objectContaining({ senha: jasmine.anything() }));
  });

  it('não deve entrar quando a API recusa a senha', async () => {
    const resposta = servico.entrar(USUARIO_DEMO.email, 'errada');

    http.expectOne(`${URL_API}/login`).flush({ erro: 'E-mail ou senha incorretos' }, { status: 401, statusText: 'Unauthorized' });

    expect(await resposta).toBeFalse();
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve falhar quando a API está fora do ar', async () => {
    const resposta = servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);

    http.expectOne(`${URL_API}/login`).error(new ProgressEvent('error'));

    await expectAsync(resposta).toBeRejected();
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve sair da conta', async () => {
    const resposta = servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    http.expectOne(`${URL_API}/login`).flush(CLIENTE_DEMO);
    await resposta;

    servico.sair();
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve manter o cliente logado depois de recarregar a página', async () => {
    const resposta = servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    http.expectOne(`${URL_API}/login`).flush(CLIENTE_DEMO);
    await resposta;

    // simula recarregar a página: um novo serviço lê a sessão que ficou no navegador
    TestBed.resetTestingModule();
    configurar();

    expect(servico.usuarioLogado()?.nome).toBe('Cliente Demo');
  });
});
