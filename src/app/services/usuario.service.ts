import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Endereco, Usuario, UsuarioLogado } from '../models/usuario.model';
import { URL_API } from './produto.service';

/**
 * Os clientes ficam no banco de dados, pela API (api/server.js).
 * No navegador fica só a sessão: quem está logado agora (sem a senha).
 */
const CHAVE_SESSAO = 'pixelthreads.sessao';

/** Onde as versões antigas do site guardavam os cadastros (com senha) no navegador. */
const CHAVE_USUARIOS_ANTIGA = 'pixelthreads.usuarios';

/**
 * Cliente que já vem cadastrado no banco, para testar o login sem precisar criar conta.
 * A API cria esse mesmo cliente quando sobe (ver api/server.js).
 */
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
  private http = inject(HttpClient);

  private logadoSinal = signal<UsuarioLogado | null>(this.carregarSessao());

  usuarioLogado = this.logadoSinal.asReadonly();
  estaLogado = computed(() => this.logadoSinal() !== null);
  primeiroNome = computed(() => this.logadoSinal()?.nome.split(' ')[0] ?? '');

  constructor() {
    // Os cadastros agora ficam no banco: apaga a cópia antiga (com senhas) que ficou no navegador.
    this.remover(localStorage, CHAVE_USUARIOS_ANTIGA);
  }

  /** Pergunta ao banco se já existe conta com este e-mail. */
  async emailCadastrado(email: string): Promise<boolean> {
    const resposta = await firstValueFrom(
      this.http.post<{ existe: boolean }>(`${URL_API}/clientes/existe`, { email: this.normalizar(email) })
    );
    return resposta.existe;
  }

  /**
   * Cadastra o cliente no banco e já deixa ele logado.
   * Retorna false se o e-mail já existir. Se a API estiver fora do ar, a Promise falha.
   */
  async cadastrar(nome: string, email: string, senha: string, endereco?: Endereco): Promise<boolean> {
    try {
      const cliente = await firstValueFrom(this.http.post<UsuarioLogado>(`${URL_API}/clientes`, {
        nome: nome.trim(), email: this.normalizar(email), senha, endereco
      }));
      this.iniciarSessao(cliente, false);
      return true;
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 409) return false;
      throw erro;
    }
  }

  /**
   * Confere e-mail e senha no banco. Com "lembrar", a sessão sobrevive a fechar o navegador.
   * Retorna false se estiverem errados. Se a API estiver fora do ar, a Promise falha.
   */
  async entrar(email: string, senha: string, lembrar = false): Promise<boolean> {
    try {
      const cliente = await firstValueFrom(
        this.http.post<UsuarioLogado>(`${URL_API}/login`, { email: this.normalizar(email), senha })
      );
      this.iniciarSessao(cliente, lembrar);
      return true;
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 401) return false;
      throw erro;
    }
  }

  sair(): void {
    this.logadoSinal.set(null);
    this.remover(localStorage, CHAVE_SESSAO);
    this.remover(sessionStorage, CHAVE_SESSAO);
  }

  private iniciarSessao(cliente: UsuarioLogado, lembrar: boolean): void {
    const sessao: UsuarioLogado = { id: cliente.id, nome: cliente.nome, email: cliente.email, endereco: cliente.endereco };
    this.logadoSinal.set(sessao);
    this.remover(lembrar ? sessionStorage : localStorage, CHAVE_SESSAO);
    this.salvar(lembrar ? localStorage : sessionStorage, CHAVE_SESSAO, sessao);
  }

  private normalizar(email: string): string {
    return email.trim().toLowerCase();
  }

  private carregarSessao(): UsuarioLogado | null {
    return this.ler<UsuarioLogado>(sessionStorage, CHAVE_SESSAO)
      ?? this.ler<UsuarioLogado>(localStorage, CHAVE_SESSAO);
  }

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo); nesse caso
  // a loja continua funcionando, só não guarda a sessão entre recarregamentos.
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
