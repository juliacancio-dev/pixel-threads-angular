export interface Usuario {
  nome: string;
  email: string;
  senha: string;
}

/** Dados do cliente logado (sem a senha). */
export type UsuarioLogado = Omit<Usuario, 'senha'>;
