import { Injectable, computed, signal } from '@angular/core';
import { Endereco, Usuario, UsuarioLogado } from '../models/usuario.model';

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
  senha: '123456',
  endereco: {
    cep: '01310-100',
    rua: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
  }
};

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarios: Usuario[] = this.carregarUsuarios();
  private logadoSinal = signal<UsuarioLogado | null>(this.carregarSessao());

  usuarioLogado = this.logadoSinal.asReadonly();
  estaLogado = computed(() => this.logadoSinal() !== null);
  primeiroNome = computed(() => this.logadoSinal()?.nome.split(' ')[0] ?? '');

  emailCadastrado(email: string): boolean {
    return this.buscarPorEmail(email) !== undefined;
  }

  /** Cadastra o cliente e já deixa ele logado. Retorna false se o e-mail já existir. */
  cadastrar(nome: string, email: string, senha: string, endereco?: Endereco): boolean {
    if (this.emailCadastrado(email)) {
      return false;
    }
    const usuario: Usuario = { nome: nome.trim(), email: this.normalizar(email), senha, endereco };
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
    this.logadoSinal.set(null);
    this.remover(localStorage, CHAVE_SESSAO);
    this.remover(sessionStorage, CHAVE_SESSAO);
  }

  private iniciarSessao(usuario: Usuario, lembrar: boolean): void {
    const sessao: UsuarioLogado = { nome: usuario.nome, email: usuario.email, endereco: usuario.endereco };
    this.logadoSinal.set(sessao);
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
    // O cliente demo sempre vem da versão atual do código, não da cópia salva.
    const outros = salvos.filter(u => u.email !== USUARIO_DEMO.email);
    return [USUARIO_DEMO, ...outros];
  }

  private carregarSessao(): UsuarioLogado | null {
    return this.ler<UsuarioLogado>(sessionStorage, CHAVE_SESSAO)
      ?? this.ler<UsuarioLogado>(localStorage, CHAVE_SESSAO);
  }

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo); nesse caso
  // a loja continua funcionando, só não guarda os dados entre recarregamentos.
  private ler<T>(armazenamento: Storage, chave: string): T | null {
    try {
      const valor = armazenamento.getItem(chave);
      return valor ? JSON.parse(valor) as T : null;
    } catch {
      return null;
    }
  }

  private salvar(armazenamento: Storage, chave: string, valor: unknown): void {
    try {
      armazenamento.setItem(chave, JSON.stringify(valor));
    } catch {
      // armazenamento indisponível: mantém só em memória
    }
  }

  private remover(armazenamento: Storage, chave: string): void {
    try {
      armazenamento.removeItem(chave);
    } catch {
      // armazenamento indisponível: nada a remover
    }
  }
}
