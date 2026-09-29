import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado e carregar os produtos', () => {
    const montagem = TestBed.createComponent(HomeComponent);
    const componente = montagem.componentInstance;

    expect(componente).toBeTruthy();
    expect(componente.produtos.length).toBeGreaterThan(0);
  });

  it('deve marcar a newsletter como inválida quando o formulário não é válido', () => {
    const montagem = TestBed.createComponent(HomeComponent);
    const componente = montagem.componentInstance;

    componente.assinarInformativo({ valid: false });
    expect(componente.informativoInvalido).toBeTrue();
  });

  it('deve limpar o campo de e-mail ao enviar a newsletter com sucesso', () => {
    const montagem = TestBed.createComponent(HomeComponent);
    const componente = montagem.componentInstance;
    componente.emailInformativo = 'usuario@pixelthreads.com';

    componente.assinarInformativo({ valid: true, resetForm: () => {} });
    expect(componente.emailInformativo).toBe('');
    expect(componente.informativoInvalido).toBeFalse();
  });
});
