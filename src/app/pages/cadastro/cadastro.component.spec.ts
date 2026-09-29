import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CadastroComponent } from './cadastro.component';
import { UsuarioService } from '../../services/usuario.service';

describe('CadastroComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('pixelthreads.usuarios');
    localStorage.removeItem('pixelthreads.sessao');
    sessionStorage.removeItem('pixelthreads.sessao');
    await TestBed.configureTestingModule({
      imports: [CadastroComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado com o formulário inválido inicialmente', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.form.valid).toBeFalse();
  });

  it('deve validar todos os campos quando preenchidos corretamente', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      aceiteTermos: true
    });

    expect(component.form.valid).toBeTrue();
  });

  it('deve invalidar o formulário quando as senhas forem diferentes', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '654321',
      aceiteTermos: true
    });

    expect(component.form.valid).toBeFalse();
    expect(component.form.errors?.['senhasDiferentes']).toBeTrue();
  });

  it('deve invalidar o formulário quando os termos não forem aceitos', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      aceiteTermos: false
    });

    expect(component.form.valid).toBeFalse();
    expect(component.form.controls.aceiteTermos.errors?.['required']).toBeTrue();
  });

  it('deve alternar a visibilidade da senha e da confirmação de senha', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    expect(component.mostrarSenha).toBeFalse();
    component.toggleSenha();
    expect(component.mostrarSenha).toBeTrue();

    expect(component.mostrarConfirmarSenha).toBeFalse();
    component.toggleConfirmarSenha();
    expect(component.mostrarConfirmarSenha).toBeTrue();
  });

  it('deve cadastrar o cliente, deixá-lo logado e ir para a loja', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;
    const usuarios = TestBed.inject(UsuarioService);
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    component.form.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      aceiteTermos: true
    });
    component.enviar();

    expect(usuarios.emailCadastrado('julia@pixelthreads.com')).toBeTrue();
    expect(usuarios.usuarioLogado()?.nome).toBe('Julia Jesus');
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('não deve cadastrar um e-mail que já existe', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    component.form.setValue({
      nome: 'Outra Pessoa',
      email: 'cliente@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      aceiteTermos: true
    });
    component.enviar();

    expect(component.form.controls.email.errors?.['emailEmUso']).toBeTrue();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    component.enviar();
    expect(component.form.touched).toBeTrue();
  });
});
