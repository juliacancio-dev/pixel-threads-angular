import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EsqueciComponent } from './esqueci.component';

describe('EsqueciComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.usuarios');
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [EsqueciComponent],
      providers: [provideRouter([])]
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

  it('deve resetar o formulário ao enviar com sucesso', () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'cliente@pixelthreads.com' });
    componente.enviar();
    expect(componente.formulario.value.email).toBe('');
  });

  it('não deve enviar o link para um e-mail que não está cadastrado', () => {
    const montagem = TestBed.createComponent(EsqueciComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({ email: 'ninguem@pixelthreads.com' });
    componente.enviar();
    expect(componente.formulario.value.email).toBe('ninguem@pixelthreads.com');
  });
});
