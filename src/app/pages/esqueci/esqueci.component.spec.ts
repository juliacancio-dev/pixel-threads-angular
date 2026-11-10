import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EsqueciComponent } from './esqueci.component';
import { URL_API } from '../../services/produto.service';

describe('EsqueciComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [EsqueciComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('deve ser criado', () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });

  it('deve validar o campo de e-mail', () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    const componente = montagem.componentInstance;

    expect(componente.formulario.valid).toBeFalse();
    componente.formulario.setValue({ email: 'usuario@pixelthreads.com' });
    expect(componente.formulario.valid).toBeTrue();
  });

  it('deve resetar o formulário ao enviar com sucesso', async () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'cliente@pixelthreads.com' });
    const envio = componente.enviar();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/clientes/existe`).flush({ existe: true });
    await envio;
    expect(componente.formulario.value.email).toBe('');
  });

  it('não deve enviar o link para um e-mail que não está cadastrado', async () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'ninguem@pixelthreads.com' });
    const envio = componente.enviar();
    TestBed.inject(HttpTestingController).expectOne(`${URL_API}/clientes/existe`).flush({ existe: false });
    await envio;
    expect(componente.formulario.value.email).toBe('ninguem@pixelthreads.com');
  });
});
