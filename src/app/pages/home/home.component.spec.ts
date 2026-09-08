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
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.produtos.length).toBeGreaterThan(0);
  });

  it('deve marcar a newsletter como inválida quando o formulário não é válido', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.enviarNewsletter({ valid: false });
    expect(component.newsletterInvalido).toBeTrue();
  });

  it('deve limpar o campo de e-mail ao enviar a newsletter com sucesso', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    component.emailNewsletter = 'usuario@pixelthreads.com';

    component.enviarNewsletter({ valid: true, resetForm: () => {} });
    expect(component.emailNewsletter).toBe('');
    expect(component.newsletterInvalido).toBeFalse();
  });
});
