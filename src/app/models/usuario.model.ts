export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Usuario {
  nome: string;
  email: string;
  senha: string;
  /** Opcional porque contas criadas antes deste campo existir não têm endereço. */
  endereco?: Endereco;
}

/** Dados do cliente logado (sem a senha). */
export type UsuarioLogado = Omit<Usuario, 'senha'>;
