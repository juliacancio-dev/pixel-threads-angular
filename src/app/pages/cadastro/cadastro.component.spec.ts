import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CadastroComponent } from './cadastro.component';

describe('CadastroComponent', () => {
  beforeEach(async () => {
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

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const component = fixture.componentInstance;

    component.enviar();
    expect(component.form.touched).toBeTrue();
  });
});
