import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { USUARIO_DEMO, UsuarioService } from '../../services/usuario.service';
import { URL_API } from '../../services/produto.service';

const CLIENTE_DEMO = { id: 1, nome: USUARIO_DEMO.nome, email: USUARIO_DEMO.email, endereco: USUARIO_DEMO.endereco };

describe('LoginComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('deve ser criado com o formulário inválido inicialmente', () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;

    expect(componente).toBeTruthy();
    expect(componente.formulario.valid).toBeFalse();
  });

  it('deve validar e-mail e senha corretamente', () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'teste@pixelthreads.com', senha: '123456', lembrar: false });
    expect(componente.formulario.valid).toBeTrue();
  });

  it('deve invalidar senha com menos de 6 caracteres', () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'teste@pixelthreads.com', senha: '123', lembrar: false });
    expect(componente.formulario.get('senha')?.valid).toBeFalse();
  });

  it('deve alternar a visibilidade da senha', () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;

    expect(componente.mostrarSenha).toBeFalse();
    componente.alternarSenha();
    expect(componente.mostrarSenha).toBeTrue();
  });

  it('deve entrar com um cliente cadastrado e ir para a loja', async () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    componente.formulario.setValue({ email: 'cliente@pixelthreads.com', senha: '123456', lembrar: false });
    const envio = componente.enviar();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/login`).flush(CLIENTE_DEMO);
    await envio;

    expect(TestBed.inject(UsuarioService).estaLogado()).toBeTrue();
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('deve voltar para a página de origem depois de entrar', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { queryParamMap: convertToParamMap({ voltar: '/cesta' }) } }
    });
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    componente.formulario.setValue({ email: 'cliente@pixelthreads.com', senha: '123456', lembrar: false });
    const envio = componente.enviar();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/login`).flush(CLIENTE_DEMO);
    await envio;

    expect(navegar).toHaveBeenCalledWith('/cesta');
  });

  it('deve ignorar endereços externos no parâmetro de volta', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { queryParamMap: convertToParamMap({ voltar: '//site-malicioso.com' }) } }
    });
    const componente = TestBed.createComponent(LoginComponent).componentInstance;

    expect(componente.voltar).toBe('/');
  });

  it('deve recusar senha incorreta', async () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    componente.formulario.setValue({ email: 'cliente@pixelthreads.com', senha: 'errada1', lembrar: false });
    const envio = componente.enviar();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/login`)
      .flush({ erro: 'E-mail ou senha incorretos' }, { status: 401, statusText: 'Unauthorized' });
    await envio;

    expect(componente.credenciaisInvalidas).toBeTrue();
    expect(TestBed.inject(UsuarioService).estaLogado()).toBeFalse();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const montagem = TestBed.createComponent(LoginComponent);
    const componente = montagem.componentInstance;

    componente.enviar();
    expect(componente.formulario.touched).toBeTrue();
  });
});
