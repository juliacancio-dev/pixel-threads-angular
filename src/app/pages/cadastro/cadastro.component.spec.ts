import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CadastroComponent } from './cadastro.component';
import { UsuarioService } from '../../services/usuario.service';

const enderecoValido = {
  cep: '01310-100',
  rua: 'Avenida Paulista',
  numero: '1000',
  complemento: '',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP'
};

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
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    expect(componente).toBeTruthy();
    expect(componente.formulario.valid).toBeFalse();
  });

  it('deve validar todos os campos quando preenchidos corretamente', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      endereco: enderecoValido,
      aceiteTermos: true
    });

    expect(componente.formulario.valid).toBeTrue();
  });

  it('deve invalidar o formulário quando as senhas forem diferentes', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '654321',
      endereco: enderecoValido,
      aceiteTermos: true
    });

    expect(componente.formulario.valid).toBeFalse();
    expect(componente.formulario.errors?.['senhasDiferentes']).toBeTrue();
  });

  it('deve invalidar o formulário quando os termos não forem aceitos', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      endereco: enderecoValido,
      aceiteTermos: false
    });

    expect(componente.formulario.valid).toBeFalse();
    expect(componente.formulario.controls.aceiteTermos.errors?.['required']).toBeTrue();
  });

  it('deve alternar a visibilidade da senha e da confirmação de senha', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    expect(componente.mostrarSenha).toBeFalse();
    componente.alternarSenha();
    expect(componente.mostrarSenha).toBeTrue();

    expect(componente.mostrarConfirmarSenha).toBeFalse();
    componente.alternarConfirmarSenha();
    expect(componente.mostrarConfirmarSenha).toBeTrue();
  });

  it('deve cadastrar o cliente, deixá-lo logado e ir para a loja', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;
    const usuarios = TestBed.inject(UsuarioService);
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    componente.formulario.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      endereco: enderecoValido,
      aceiteTermos: true
    });
    componente.enviar();

    expect(usuarios.emailCadastrado('julia@pixelthreads.com')).toBeTrue();
    expect(usuarios.usuarioLogado()?.nome).toBe('Julia Jesus');
    expect(usuarios.usuarioLogado()?.endereco).toEqual(enderecoValido);
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('deve invalidar o formulário quando o endereço estiver incompleto ou com CEP inválido', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.formulario.setValue({
      nome: 'Julia Jesus',
      email: 'julia@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      endereco: { ...enderecoValido, cep: '123', numero: '' },
      aceiteTermos: true
    });

    expect(componente.formulario.valid).toBeFalse();
    expect(componente.formulario.get('endereco.cep')?.errors?.['pattern']).toBeTruthy();
    expect(componente.formulario.get('endereco.numero')?.errors?.['required']).toBeTrue();
  });

  it('deve aceitar o complemento vazio, pois é opcional', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.formulario.controls.endereco.setValue({ ...enderecoValido, complemento: '' });
    expect(componente.formulario.controls.endereco.valid).toBeTrue();
  });

  it('não deve cadastrar um e-mail que já existe', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');

    componente.formulario.setValue({
      nome: 'Outra Pessoa',
      email: 'cliente@pixelthreads.com',
      senha: '123456',
      confirmarSenha: '123456',
      endereco: enderecoValido,
      aceiteTermos: true
    });
    componente.enviar();

    expect(componente.formulario.controls.email.errors?.['emailEmUso']).toBeTrue();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('deve marcar todos os campos como tocados ao enviar formulário inválido', () => {
    const montagem = TestBed.createComponent(CadastroComponent);
    const componente = montagem.componentInstance;

    componente.enviar();
    expect(componente.formulario.touched).toBeTrue();
  });
});
