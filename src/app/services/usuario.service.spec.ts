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
    const servico = TestBed.inject(UsuarioService);

    expect(servico.emailCadastrado(USUARIO_DEMO.email)).toBeTrue();
    expect(servico.estaLogado()).toBeFalse();
  });

  it('deve cadastrar um cliente e deixá-lo logado', () => {
    const servico = TestBed.inject(UsuarioService);

    expect(servico.cadastrar('Maria Souza', 'Maria@Teste.com ', 'segredo')).toBeTrue();
    expect(servico.emailCadastrado('maria@teste.com')).toBeTrue();
    expect(servico.primeiroNome()).toBe('Maria');
  });

  it('não deve cadastrar o mesmo e-mail duas vezes', () => {
    const servico = TestBed.inject(UsuarioService);

    servico.cadastrar('Maria Souza', 'maria@teste.com', 'segredo');
    expect(servico.cadastrar('Outra Maria', 'MARIA@teste.com', 'outra')).toBeFalse();
  });

  it('deve entrar apenas com e-mail e senha corretos', () => {
    const servico = TestBed.inject(UsuarioService);

    expect(servico.entrar(USUARIO_DEMO.email, 'errada')).toBeFalse();
    expect(servico.entrar('naoexiste@teste.com', USUARIO_DEMO.senha)).toBeFalse();
    expect(servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha)).toBeTrue();
    expect(servico.usuarioLogado()?.email).toBe(USUARIO_DEMO.email);
  });

  it('deve sair da conta', () => {
    const servico = TestBed.inject(UsuarioService);

    servico.entrar(USUARIO_DEMO.email, USUARIO_DEMO.senha);
    servico.sair();
    expect(servico.estaLogado()).toBeFalse();
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
