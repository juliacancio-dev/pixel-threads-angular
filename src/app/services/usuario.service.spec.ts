import { TestBed } from '@angular/core/testing';
import { USUARIO_DEMO, UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  beforeEach(() => {
    localStorage.removeItem('pixelthreads.usuarios');
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    TestBed.configureTestingModule({});
  });

  it('deve vir com o cliente de demonstração cadastrado e ninguém logado', () => {
    const service = TestBed.inject(UsuarioService);

    expect(service.emailCadastrado(USUARIO_DEMO.email)).toBeTrue();
    expect(service.estaLogado()).toBeFalse();
  });

  it('deve cadastrar um cliente e deixá-lo logado', () => {
    const service = TestBed.inject(UsuarioService);

    expect(service.cadastrar('Maria Souza', 'Maria@Teste.com ', 'segredo')).toBeTrue();
    expect(service.emailCadastrado('maria@teste.com')).toBeTrue();
    expect(service.primeiroNome()).toBe('Maria');
  });

  it('não deve cadastrar o mesmo e-mail duas vezes', () => {
    const service = TestBed.inject(UsuarioService);

    service.cadastrar('Maria Souza', 'maria@teste.com', 'segredo');
    expect(service.cadastrar('Outra Maria', 'MARIA@teste.com', 'outra')).toBeFalse();
  });

  it('deve entrar apenas com e-mail e senha corretos', () => {
    const service = TestBed.inject(UsuarioService);

    expect(service.entrar(USUARIO_DEMO.email, 'errada')).toBeFalse();
    expect(service.entrar('naoexiste@teste.com', USUARIO_DEMO.senha)).toBeFalse();
    expect(service.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha)).toBeTrue();
    expect(service.usuarioLogado()?.email).toBe(USUARIO_DEMO.email);
  });

  it('deve sair da conta', () => {
    const service = TestBed.inject(UsuarioService);

    service.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    service.sair();
    expect(service.estaLogado()).toBeFalse();
  });

  it('deve manter os cadastros salvos depois de recarregar a página', () => {
    TestBed.inject(UsuarioService).cadastrar('Maria Souza', 'maria@teste.com', 'segredo');

    // simula recarregar a página: um novo serviço lê o que ficou salvo no navegador
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const recarregado = TestBed.inject(UsuarioService);

    expect(recarregado.emailCadastrado('maria@teste.com')).toBeTrue();
    expect(recarregado.usuarioLogado()?.nome).toBe('Maria Souza');
  });
});
