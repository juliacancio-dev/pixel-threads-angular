import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado com o formulário inválido inicialmente', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.form.valid).toBeFalse();
  });

  it('deve validar e-mail e senha corretamente', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'teste@pixelthreads.com', senha: '123456', lembrar: false });
    expect(component.form.valid).toBeTrue();
  });

  it('deve invalidar senha com menos de 6 caracteres', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'teste@pixelthreads.com', senha: '123', lembrar: false });
    expect(component.form.get('senha')?.valid).toBeFalse();
  });

  it('deve alternar a visibilidade da senha', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    expect(component.mostrarSenha).toBeFalse();
    component.toggleSenha();
    expect(component.mostrarSenha).toBeTrue();
  });

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.enviar();
    expect(component.form.touched).toBeTrue();
  });
});
