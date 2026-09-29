import { Injectable, computed, signal } from '@angular/core';
import { Usuario, UsuarioLogado } from '../models/usuario.model';

/**
 * Simula o banco de dados de clientes da loja.
 * Os cadastros ficam salvos no localStorage do navegador, então continuam
 * existindo depois de recarregar a página (mas só neste navegador).
 */
const CHAVE_USUARIOS = 'pixelthreads.usuarios';
const CHAVE_SESSAO = 'pixelthreads.sessao';

/** Cliente que já vem cadastrado, para testar o login sem precisar criar conta. */
export const USUARIO_DEMO: Usuario = {
  nome: 'Cliente Demo',
  email: 'cliente@pixelthreads.com',
  senha: '123456'
};

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarios: Usuario[] = this.carregarUsuarios();
  private logadoSignal = signal<UsuarioLogado | null>(this.carregarSessao());

  usuarioLogado = this.logadoSignal.asReadonly();
  estaLogado = computed(() => this.logadoSignal() !== null);
  primeiroNome = computed(() => this.logadoSignal()?.nome.split(' ')[0] ?? '');

  emailCadastrado(email: string): boolean {
    return this.buscarPorEmail(email) !== undefined;
  }

  /** Cadastra o cliente e já deixa ele logado. Retorna false se o e-mail já existir. */
  cadastrar(nome: string, email: string, senha: string): boolean {
    if (this.emailCadastrado(email)) {
      return false;
    }
    const usuario: Usuario = { nome: nome.trim(), email: this.normalizar(email), senha };
    this.usuarios = [...this.usuarios, usuario];
    this.salvar(localStorage, CHAVE_USUARIOS, this.usuarios);
    this.iniciarSessao(usuario, false);
    return true;
  }

  /** Confere e-mail e senha. Com "lembrar", a sessão sobrevive a fechar o navegador. */
  entrar(email: string, senha: string, lembrar = false): boolean {
    const usuario = this.buscarPorEmail(email);
    if (!usuario || usuario.senha !== senha) {
      return false;
    }
    this.iniciarSessao(usuario, lembrar);
    return true;
  }

  sair(): void {
    this.logadoSignal.set(null);
    this.remover(localStorage, CHAVE_SESSAO);
    this.remover(sessionStorage, CHAVE_SESSAO);
  }

  private iniciarSessao(usuario: Usuario, lembrar: boolean): void {
    const sessao: UsuarioLogado = { nome: usuario.nome, email: usuario.email };
    this.logadoSignal.set(sessao);
    this.remover(lembrar ? sessionStorage : localStorage, CHAVE_SESSAO);
    this.salvar(lembrar ? localStorage : sessionStorage, CHAVE_SESSAO, sessao);
  }

  private buscarPorEmail(email: string): Usuario | undefined {
    const alvo = this.normalizar(email);
    return this.usuarios.find(u => u.email === alvo);
  }

  private normalizar(email: string): string {
    return email.trim().toLowerCase();
  }

  private carregarUsuarios(): Usuario[] {
    const salvos = this.ler<Usuario[]>(localStorage, CHAVE_USUARIOS) ?? [];
    const temDemo = salvos.some(u => u.email === USUARIO_DEMO.email);
    return temDemo ? salvos : [USUARIO_DEMO, ...salvos];
  }

  private carregarSessao(): UsuarioLogado | null {
    return this.ler<UsuarioLogado>(sessionStorage, CHAVE_SESSAO)
      ?? this.ler<UsuarioLogado>(localStorage, CHAVE_SESSAO);
  }

  // O navegador pode bloquear o storage (aba anônima, por exemplo); nesse caso
  // a loja continua funcionando, só não guarda os dados entre recarregamentos.
  private ler<T>(storage: Storage, chave: string): T | null {
    try {
      const valor = storage.getItem(chave);
      return valor ? JSON.parse(valor) as T : null;
    } catch {
      return null;
    }
  }

  private salvar(storage: Storage, chave: string, valor: unknown): void {
    try {
      storage.setItem(chave, JSON.stringify(valor));
    } catch {
      // storage indisponível: mantém só em memória
    }
  }

  private remover(storage: Storage, chave: string): void {
    try {
      storage.removeItem(chave);
    } catch {
      // storage indisponível: nada a remover
    }
  }
}
