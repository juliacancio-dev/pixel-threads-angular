import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { UsuarioService } from '../../services/usuario.service';

describe('LoginComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.usuarios');
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
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

  it('deve entrar com um cliente cadastrado e ir para a loja', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    component.form.setValue({ email: 'cliente@pixelthreads.com', senha: '123456', lembrar: false });
    component.enviar();

    expect(TestBed.inject(UsuarioService).estaLogado()).toBeTrue();
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('deve voltar para a página de origem depois de entrar', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { queryParamMap: convertToParamMap({ voltar: '/cesta' }) } }
    });
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    component.form.setValue({ email: 'cliente@pixelthreads.com', senha: '123456', lembrar: false });
    component.enviar();

    expect(navegar).toHaveBeenCalledWith('/cesta');
  });

  it('deve ignorar endereços externos no parâmetro de volta', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { queryParamMap: convertToParamMap({ voltar: '//site-malicioso.com' }) } }
    });
    const component = TestBed.createComponent(LoginComponent).componentInstance;

    expect(component.voltar).toBe('/');
  });

  it('deve recusar senha incorreta', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    component.form.setValue({ email: 'cliente@pixelthreads.com', senha: 'errada1', lembrar: false });
    component.enviar();

    expect(component.credenciaisInvalidas).toBeTrue();
    expect(TestBed.inject(UsuarioService).estaLogado()).toBeFalse();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.enviar();
    expect(component.form.touched).toBeTrue();
  });
});
