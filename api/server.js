// API da Pixel Threads: produtos e clientes salvos em SQLite (api/pixelthreads.db).
// Usa só módulos que já vêm no Node 24 (node:http e node:sqlite), sem instalar nada.
// Para rodar: npm run api   (porta 3000)

const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORTA = Number(process.env.PORT) || 3000;
const ARQUIVO_BANCO = path.join(__dirname, 'pixelthreads.db');

const db = new DatabaseSync(ARQUIVO_BANCO);

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT    NOT NULL,
    categoria    TEXT    NOT NULL,
    imagem       TEXT    NOT NULL,
    fotos        TEXT,
    tamanhos     TEXT    NOT NULL,
    preco        REAL    NOT NULL,
    preco_antigo REAL,
    novo         INTEGER NOT NULL DEFAULT 0,
    descricao    TEXT
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    senha       TEXT NOT NULL,
    cep         TEXT,
    rua         TEXT,
    numero      TEXT,
    complemento TEXT,
    bairro      TEXT,
    cidade      TEXT,
    estado      TEXT
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    data       TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'recebido',
    subtotal   REAL    NOT NULL DEFAULT 0,
    frete      REAL    NOT NULL DEFAULT 0,
    total      REAL    NOT NULL DEFAULT 0
  );

  -- Cada item guarda uma cópia do nome e do preço da hora da compra,
  -- então mudar ou apagar o produto depois não altera pedidos antigos.
  CREATE TABLE IF NOT EXISTS itens_pedido (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id  INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL,
    nome       TEXT    NOT NULL,
    imagem     TEXT,
    tamanho    TEXT    NOT NULL,
    quantidade INTEGER NOT NULL,
    preco      REAL    NOT NULL
  );
`);

// Bancos criados antes dos pedidos não têm a coluna "documento" (CPF/CNPJ, usada em "alterar senha").
if (!db.prepare('PRAGMA table_info(clientes)').all().some(coluna => coluna.name === 'documento')) {
  db.exec('ALTER TABLE clientes ADD COLUMN documento TEXT');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS cupons (
    codigo     TEXT PRIMARY KEY,
    percentual REAL NOT NULL CHECK (percentual > 0 AND percentual <= 100),
    ativo      INTEGER NOT NULL DEFAULT 1
  );
`);
// Pedidos criados antes dos cupons não têm estas colunas.
for (const [coluna, definicao] of [['cupom', 'TEXT'], ['desconto', 'REAL NOT NULL DEFAULT 0']]) {
  if (!db.prepare('PRAGMA table_info(pedidos)').all().some(c => c.name === coluna)) {
    db.exec(`ALTER TABLE pedidos ADD COLUMN ${coluna} ${definicao}`);
  }
}
// Cupom do banner do site ("USE O CUPOM PIXEL10 E GANHE 10% OFF").
db.prepare('INSERT OR IGNORE INTO cupons (codigo, percentual) VALUES (?, ?)').run('PIXEL10', 10);

const SENHA_RESETADA = 'Senha1234';
const FRETE_PADRAO = 19.9;
const FRETE_GRATIS_ACIMA_DE = 150;

// ---------- senhas ----------
// A senha nunca é guardada como foi digitada: o banco guarda "sal:hash" (scrypt).

function gerarHashSenha(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
  return `${sal}:${hash}`;
}

function senhaConfere(senha, guardada) {
  const [sal, hash] = guardada.split(':');
  if (!sal || !hash) return false;
  const tentativa = crypto.scryptSync(senha, sal, 64);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === tentativa.length && crypto.timingSafeEqual(esperado, tentativa);
}

// Cliente de demonstração (o mesmo de USUARIO_DEMO, em src/app/services/usuario.service.ts),
// para dar para testar o login do site sem criar conta.
if (!db.prepare('SELECT 1 FROM clientes WHERE email = ?').get('cliente@pixelthreads.com')) {
  db.prepare(`
    INSERT INTO clientes (nome, email, senha, cep, rua, numero, complemento, bairro, cidade, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Cliente Demo', 'cliente@pixelthreads.com', gerarHashSenha('123456'),
         '01310-100', 'Avenida Paulista', '1000', 'Apto 42', 'Bela Vista', 'São Paulo', 'SP');
}

// ---------- conversão entre linha do banco e JSON (mesmo formato dos models do Angular) ----------

function produtoParaJson(linha) {
  const produto = {
    id: linha.id,
    nome: linha.nome,
    categoria: linha.categoria,
    imagem: linha.imagem,
    tamanhos: JSON.parse(linha.tamanhos),
    preco: linha.preco,
    novo: linha.novo === 1
  };
  if (linha.fotos !== null) produto.fotos = JSON.parse(linha.fotos);
  if (linha.preco_antigo !== null) produto.precoAntigo = linha.preco_antigo;
  if (linha.descricao !== null) produto.descricao = linha.descricao;
  return produto;
}

/** A senha nunca volta nas respostas. */
function clienteParaJson(linha) {
  return {
    id: linha.id,
    codigo: linha.id,
    nome: linha.nome,
    email: linha.email,
    documento: linha.documento ?? '',
    endereco: {
      cep: linha.cep ?? '',
      rua: linha.rua ?? '',
      numero: linha.numero ?? '',
      complemento: linha.complemento ?? '',
      bairro: linha.bairro ?? '',
      cidade: linha.cidade ?? '',
      estado: linha.estado ?? ''
    }
  };
}

// ---------- validação ----------

function validarProduto(p) {
  const erros = [];
  if (!texto(p.nome)) erros.push('nome é obrigatório');
  if (!texto(p.categoria)) erros.push('categoria é obrigatória');
  if (!texto(p.imagem)) erros.push('imagem é obrigatória');
  if (!Array.isArray(p.tamanhos) || p.tamanhos.length === 0) erros.push('tamanhos deve ser uma lista com pelo menos um tamanho');
  if (typeof p.preco !== 'number' || p.preco <= 0) erros.push('preco deve ser um número maior que zero');
  if (p.fotos !== undefined && (!Array.isArray(p.fotos) || !p.fotos.every(texto))) erros.push('fotos deve ser uma lista de caminhos de imagem');
  if (p.precoAntigo !== undefined && typeof p.precoAntigo !== 'number') erros.push('precoAntigo deve ser um número');
  return erros;
}

function validarCliente(c) {
  const erros = [];
  if (!texto(c.nome)) erros.push('nome é obrigatório');
  if (!texto(c.email) || !c.email.includes('@')) erros.push('email inválido');
  if (!texto(c.senha) || c.senha.length < 6) erros.push('senha deve ter pelo menos 6 caracteres');
  if (c.endereco !== undefined && (typeof c.endereco !== 'object' || c.endereco === null)) erros.push('endereco deve ser um objeto');
  return erros;
}

function texto(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

function enderecoParaColunas(endereco = {}) {
  return [endereco.cep, endereco.rua, endereco.numero, endereco.complemento,
          endereco.bairro, endereco.cidade, endereco.estado].map(v => v ?? null);
}

// ---------- operações compartilhadas ----------
// Cada operação existe em duas versões de rota: a do site (JSON, em /api/produtos, /api/clientes,
// /api/pedidos) e a do contrato do professor (/api/produto, /api/cliente, /api/pedido).
// As duas chamam as mesmas funções abaixo. Todas devolvem [status, corpo].

const produtoPorId = id => db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
const clientePorId = id => db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);

function criarProduto(corpo) {
  const erros = validarProduto(corpo);
  if (erros.length) return [400, { erros }];
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO produtos (nome, categoria, imagem, fotos, tamanhos, preco, preco_antigo, novo, descricao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(corpo.nome.trim(), corpo.categoria.trim(), corpo.imagem,
         corpo.fotos ? JSON.stringify(corpo.fotos) : null, JSON.stringify(corpo.tamanhos),
         corpo.preco, corpo.precoAntigo ?? null, corpo.novo ? 1 : 0, corpo.descricao ?? null);
  return [201, produtoParaJson(produtoPorId(lastInsertRowid))];
}

function criarCliente(corpo) {
  const erros = validarCliente(corpo);
  if (erros.length) return [400, { erros }];
  const email = corpo.email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM clientes WHERE email = ?').get(email)) {
    return [409, { erro: 'E-mail já cadastrado' }];
  }
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO clientes (nome, email, senha, documento, cep, rua, numero, complemento, bairro, cidade, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(corpo.nome.trim(), email, gerarHashSenha(corpo.senha), corpo.documento ?? null,
         ...enderecoParaColunas(corpo.endereco));
  return [201, clienteParaJson(clientePorId(lastInsertRowid))];
}

function removerPorId(tabela, id, rotulo) {
  const { changes } = db.prepare(`DELETE FROM ${tabela} WHERE id = ?`).run(id);
  return changes ? [200, `${rotulo} removido com sucesso!`] : [404, `${rotulo} não encontrado!`];
}

function pedidoParaJson(linha) {
  const itens = db.prepare('SELECT * FROM itens_pedido WHERE pedido_id = ? ORDER BY id').all(linha.id)
    .map(i => ({ produtoId: i.produto_id, nome: i.nome, imagem: i.imagem, tamanho: i.tamanho,
                 quantidade: i.quantidade, preco: i.preco }));
  const pedido = {
    codigoPedido: linha.id,
    clienteId: linha.cliente_id,
    data: linha.data,
    status: linha.status,
    subtotal: linha.subtotal,
    frete: linha.frete,
    cupom: linha.cupom,
    desconto: linha.desconto,
    total: linha.total,
    itens
  };
  const cliente = linha.cliente_id === null ? null : clientePorId(linha.cliente_id);
  if (cliente) pedido.enderecoEntrega = clienteParaJson(cliente).endereco;
  return pedido;
}

/**
 * Confere os itens do pedido. O preço e o nome vêm sempre da tabela de produtos,
 * nunca do que o navegador mandou, para ninguém conseguir comprar por um preço inventado.
 */
function prepararItens(itens) {
  if (!Array.isArray(itens)) return { erros: ['itens deve ser uma lista'] };
  const erros = [];
  const prontos = [];
  itens.forEach((item, i) => {
    const produto = Number.isInteger(item?.produtoId) ? produtoPorId(item.produtoId) : undefined;
    if (!produto) return erros.push(`itens[${i}]: produtoId não existe`);
    if (!texto(item.tamanho) || !JSON.parse(produto.tamanhos).includes(item.tamanho)) {
      return erros.push(`itens[${i}]: tamanho inválido para este produto`);
    }
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 10) {
      return erros.push(`itens[${i}]: quantidade deve ser um inteiro de 1 a 10`);
    }
    prontos.push({ produtoId: produto.id, nome: produto.nome, imagem: produto.imagem,
                   tamanho: item.tamanho, quantidade: item.quantidade, preco: produto.preco });
  });
  return { erros, itens: prontos };
}

const arredondar = valor => Math.round(valor * 100) / 100;

/**
 * Procura o cupom pelo código (sem diferenciar maiúsculas). Retorna a linha do banco ou undefined.
 * Só existe cupom ativo; desligar um cupom é mudar "ativo" para 0 na tabela.
 */
function buscarCupom(codigo) {
  if (!texto(codigo)) return undefined;
  return db.prepare('SELECT * FROM cupons WHERE codigo = ? AND ativo = 1').get(codigo.trim().toUpperCase());
}

const cupomParaJson = linha => ({ codigo: linha.codigo, percentual: linha.percentual, ativo: linha.ativo === 1 });

/** Código do cupom: 3 a 20 letras, números, "-" ou "_". Sempre guardado em maiúsculas. */
const CODIGO_CUPOM = /^[A-Za-z0-9_-]{3,20}$/;

function validarPercentual(percentual) {
  return typeof percentual === 'number' && percentual >= 1 && percentual <= 100
    ? null : 'percentual deve ser um número de 1 a 100';
}

function criarCupom(corpo) {
  const erros = [];
  if (!texto(corpo.codigo) || !CODIGO_CUPOM.test(corpo.codigo.trim())) erros.push('codigo deve ter de 3 a 20 letras, números, "-" ou "_"');
  const erroPercentual = validarPercentual(corpo.percentual);
  if (erroPercentual) erros.push(erroPercentual);
  if (corpo.ativo !== undefined && typeof corpo.ativo !== 'boolean') erros.push('ativo deve ser true ou false');
  if (erros.length) return [400, { erros }];
  const codigo = corpo.codigo.trim().toUpperCase();
  if (db.prepare('SELECT 1 FROM cupons WHERE codigo = ?').get(codigo)) return [409, { erro: 'Já existe um cupom com este código' }];
  db.prepare('INSERT INTO cupons (codigo, percentual, ativo) VALUES (?, ?, ?)').run(codigo, corpo.percentual, corpo.ativo === false ? 0 : 1);
  return [201, cupomParaJson(cupomPorCodigo(codigo))];
}

/** Cupom pelo código, ativo ou não (quem confere se está ativo é buscarCupom). */
const cupomPorCodigo = codigo => db.prepare('SELECT * FROM cupons WHERE codigo = ?').get(String(codigo).trim().toUpperCase());

function alterarCupom(codigo, corpo) {
  const atual = cupomPorCodigo(codigo);
  if (!atual) return [404, { erro: 'Cupom não encontrado' }];
  const erros = [];
  if (corpo.percentual !== undefined) { const e = validarPercentual(corpo.percentual); if (e) erros.push(e); }
  if (corpo.ativo !== undefined && typeof corpo.ativo !== 'boolean') erros.push('ativo deve ser true ou false');
  if (erros.length) return [400, { erros }];
  db.prepare('UPDATE cupons SET percentual = ?, ativo = ? WHERE codigo = ?')
    .run(corpo.percentual ?? atual.percentual, (corpo.ativo ?? atual.ativo === 1) ? 1 : 0, atual.codigo);
  return [200, cupomParaJson(cupomPorCodigo(atual.codigo))];
}

/**
 * Grava os itens e recalcula os valores do pedido:
 * subtotal, desconto do cupom (só sobre os produtos), frete (grátis a partir de R$ 150 de subtotal) e total.
 */
function gravarItens(pedidoId, itens, cupom) {
  db.prepare('DELETE FROM itens_pedido WHERE pedido_id = ?').run(pedidoId);
  const inserir = db.prepare(`
    INSERT INTO itens_pedido (pedido_id, produto_id, nome, imagem, tamanho, quantidade, preco)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const i of itens) inserir.run(pedidoId, i.produtoId, i.nome, i.imagem, i.tamanho, i.quantidade, i.preco);
  const subtotal = arredondar(itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0));
  const desconto = cupom ? arredondar(subtotal * cupom.percentual / 100) : 0;
  const frete = itens.length === 0 || subtotal >= FRETE_GRATIS_ACIMA_DE ? 0 : FRETE_PADRAO;
  const total = arredondar(subtotal - desconto + frete);
  db.prepare('UPDATE pedidos SET subtotal = ?, frete = ?, cupom = ?, desconto = ?, total = ? WHERE id = ?')
    .run(subtotal, frete, cupom?.codigo ?? null, desconto, total, pedidoId);
}

/** Roda a função dentro de uma transação: ou grava o pedido inteiro, ou nada. */
function emTransacao(funcao) {
  db.exec('BEGIN');
  try {
    const resultado = funcao();
    db.exec('COMMIT');
    return resultado;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}

function validarClienteDoPedido(corpo) {
  if (corpo.clienteId === undefined || corpo.clienteId === null) return null;
  if (!Number.isInteger(corpo.clienteId) || !clientePorId(corpo.clienteId)) return 'clienteId não existe';
  return null;
}

function criarPedido(corpo) {
  const erros = [];
  const erroCliente = validarClienteDoPedido(corpo);
  if (erroCliente) erros.push(erroCliente);
  const conferidos = corpo.itens === undefined ? { erros: [], itens: [] } : prepararItens(corpo.itens);
  erros.push(...conferidos.erros);
  const cupom = texto(corpo.cupom) ? buscarCupom(corpo.cupom) : undefined;
  if (corpo.cupom !== undefined && corpo.cupom !== null && !cupom) erros.push('cupom inválido ou inativo');

  // O código do pedido normalmente é gerado pelo banco; o contrato permite mandar um (ex.: {"codigoPedido": 1}).
  const codigo = corpo.codigoPedido;
  if (codigo !== undefined && (!Number.isInteger(codigo) || codigo < 1)) erros.push('codigoPedido deve ser um inteiro maior que zero');
  else if (codigo !== undefined && db.prepare('SELECT 1 FROM pedidos WHERE id = ?').get(codigo)) {
    return [409, { erro: 'Já existe um pedido com este código' }];
  }
  if (erros.length) return [400, { erros }];

  const id = emTransacao(() => {
    const { lastInsertRowid } = db.prepare('INSERT INTO pedidos (id, cliente_id, data) VALUES (?, ?, ?)')
      .run(codigo ?? null, corpo.clienteId ?? null, new Date().toISOString());
    gravarItens(lastInsertRowid, conferidos.itens, cupom);
    return lastInsertRowid;
  });
  return [201, pedidoParaJson(db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id))];
}

const STATUS_PEDIDO = ['recebido', 'pago', 'enviado', 'entregue', 'cancelado'];

function alterarPedido(corpo) {
  const linha = Number.isInteger(corpo.codigoPedido)
    ? db.prepare('SELECT * FROM pedidos WHERE id = ?').get(corpo.codigoPedido) : undefined;
  if (!linha) return [404, { erro: 'Pedido não encontrado!' }];

  const erros = [];
  if (corpo.status !== undefined && !STATUS_PEDIDO.includes(corpo.status)) erros.push(`status deve ser um de: ${STATUS_PEDIDO.join(', ')}`);
  const erroCliente = validarClienteDoPedido(corpo);
  if (erroCliente) erros.push(erroCliente);
  const conferidos = corpo.itens === undefined ? null : prepararItens(corpo.itens);
  if (conferidos) erros.push(...conferidos.erros);
  if (erros.length) return [400, { erros }];

  emTransacao(() => {
    db.prepare('UPDATE pedidos SET status = ?, cliente_id = ? WHERE id = ?')
      .run(corpo.status ?? linha.status, corpo.clienteId === undefined ? linha.cliente_id : corpo.clienteId, linha.id);
    // Ao trocar os itens, o cupom que já estava no pedido continua valendo.
    if (conferidos) gravarItens(linha.id, conferidos.itens, buscarCupom(linha.cupom ?? ''));
  });
  return [200, pedidoParaJson(db.prepare('SELECT * FROM pedidos WHERE id = ?').get(linha.id))];
}

/** No contrato do professor, gravar/alterar/excluir respondem com uma frase em texto, não com JSON. */
function comoTexto([status, corpo], frase, id) {
  return status < 300 ? [200, `${frase} ${id ?? corpo.id ?? corpo.codigoPedido}`] : [status, corpo.erro ?? corpo];
}

/** Produto no formato do contrato: o do site mais "codigo" e "valor". */
function produtoContrato(linha) {
  const p = produtoParaJson(linha);
  return { codigo: p.id, ...p, valor: p.preco };
}

/** O contrato só tem descricao e valor; o que faltar ganha um valor padrão para o produto aparecer na loja. */
function produtoDoContrato(corpo) {
  return {
    ...corpo,
    nome: corpo.nome ?? corpo.descricao,
    preco: corpo.preco ?? corpo.valor,
    categoria: corpo.categoria ?? 'Camisetas',
    imagem: corpo.imagem ?? 'assets/produtos/you-are-offline/foto-1.webp',
    tamanhos: corpo.tamanhos ?? ['P', 'M', 'G', 'GG']
  };
}

/** PUT do contrato: só troca o que veio no corpo e mantém o resto como estava. */
function alterarClienteDoContrato(corpo) {
  const atual = Number.isInteger(corpo.codigo) ? clientePorId(corpo.codigo) : undefined;
  if (!atual) return [404, { erro: 'Cliente não encontrado!' }];
  const dados = { ...corpo, nome: corpo.nome ?? atual.nome, email: corpo.email ?? atual.email };
  const erros = [];
  if (!texto(dados.nome)) erros.push('nome é obrigatório');
  if (!texto(dados.email) || !dados.email.includes('@')) erros.push('email inválido');
  if (corpo.senha !== undefined && (!texto(corpo.senha) || corpo.senha.length < 6)) erros.push('senha deve ter pelo menos 6 caracteres');
  if (erros.length) return [400, { erros }];
  const email = dados.email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM clientes WHERE email = ? AND id <> ?').get(email, atual.id)) {
    return [409, { erro: 'E-mail já cadastrado para outro cliente' }];
  }
  const endereco = corpo.endereco === undefined ? enderecoDoCliente(atual) : corpo.endereco;
  db.prepare(`
    UPDATE clientes
       SET nome = ?, email = ?, senha = ?, documento = ?, cep = ?, rua = ?, numero = ?,
           complemento = ?, bairro = ?, cidade = ?, estado = ?
     WHERE id = ?
  `).run(dados.nome.trim(), email, corpo.senha === undefined ? atual.senha : gerarHashSenha(corpo.senha),
         corpo.documento ?? atual.documento, ...enderecoParaColunas(endereco), atual.id);
  return [200, clienteParaJson(clientePorId(atual.id))];
}

const enderecoDoCliente = linha => clienteParaJson(linha).endereco;

function definirSenha(email, senha, documento) {
  if (!texto(email)) return [400, { erro: 'email é obrigatório' }];
  const cliente = db.prepare('SELECT * FROM clientes WHERE email = ?').get(email.trim().toLowerCase());
  if (!cliente) return [404, { erro: 'Cliente não encontrado!' }];
  if (documento !== undefined && (!cliente.documento || cliente.documento !== documento)) {
    return [403, { erro: 'Documento não confere com o cadastro' }];
  }
  if (!texto(senha) || senha.length < 6) return [400, { erro: 'senha deve ter pelo menos 6 caracteres' }];
  db.prepare('UPDATE clientes SET senha = ? WHERE id = ?').run(gerarHashSenha(senha), cliente.id);
  return [200, null];
}

// ---------- rotas ----------

const rotas = [
  ['GET', /^\/$/, () => [200, {
    api: 'Pixel Threads',
    rotas: [
      'GET  /api/produtos',
      'GET  /api/produtos/{id}',
      'POST /api/produtos',
      'GET  /api/clientes',
      'GET  /api/clientes/{id}',
      'POST /api/clientes',
      'PUT  /api/clientes/{id}',
      'POST /api/clientes/existe',
      'POST /api/login',
      'GET  /api/pedidos',
      'GET  /api/pedidos/{id}',
      'POST /api/pedidos',
      'POST /api/cupons/validar',
      'GET  /api/cupons',
      'GET  /api/cupons/{codigo}',
      'POST /api/cupons',
      'PUT  /api/cupons/{codigo}',
      'DELETE /api/cupons/{codigo}',
      '--- contrato do professor ---',
      'GET|POST|PUT|DELETE /api/produto, GET /api/produto/vitrine, GET /api/produto/busca/{termo}',
      'GET|POST|PUT|DELETE /api/cliente, POST /api/cliente/login, PATCH /api/cliente/resetarSenha|alterarSenha',
      'GET|POST|PUT|DELETE /api/pedido'
    ]
  }]],

  ['GET', /^\/api\/produtos$/, () => {
    const linhas = db.prepare('SELECT * FROM produtos ORDER BY id').all();
    return [200, linhas.map(produtoParaJson)];
  }],

  ['GET', /^\/api\/produtos\/(\d+)$/, (_, id) => {
    const linha = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    return linha ? [200, produtoParaJson(linha)] : [404, { erro: 'Produto não encontrado' }];
  }],

  ['POST', /^\/api\/produtos$/, criarProduto],

  ['GET', /^\/api\/clientes$/, () => {
    const linhas = db.prepare('SELECT * FROM clientes ORDER BY id').all();
    return [200, linhas.map(clienteParaJson)];
  }],

  ['GET', /^\/api\/clientes\/(\d+)$/, (_, id) => {
    const linha = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    return linha ? [200, clienteParaJson(linha)] : [404, { erro: 'Cliente não encontrado' }];
  }],

  ['POST', /^\/api\/clientes$/, criarCliente],

  // Usado pela página "Esqueci a senha". O e-mail vai no corpo, não na URL.
  ['POST', /^\/api\/clientes\/existe$/, (corpo) => {
    if (!texto(corpo.email)) return [400, { erro: 'email é obrigatório' }];
    const existe = !!db.prepare('SELECT 1 FROM clientes WHERE email = ?').get(corpo.email.trim().toLowerCase());
    return [200, { existe }];
  }],

  ['POST', /^\/api\/login$/, (corpo) => {
    if (!texto(corpo.email) || !texto(corpo.senha)) return [400, { erro: 'email e senha são obrigatórios' }];
    const linha = db.prepare('SELECT * FROM clientes WHERE email = ?').get(corpo.email.trim().toLowerCase());
    if (!linha || !senhaConfere(corpo.senha, linha.senha)) {
      return [401, { erro: 'E-mail ou senha incorretos' }];
    }
    return [200, clienteParaJson(linha)];
  }],

  // PUT substitui o cadastro inteiro: mande todos os campos no corpo.
  ['PUT', /^\/api\/clientes\/(\d+)$/, (corpo, id) => {
    if (!db.prepare('SELECT 1 FROM clientes WHERE id = ?').get(id)) {
      return [404, { erro: 'Cliente não encontrado' }];
    }
    const erros = validarCliente(corpo);
    if (erros.length) return [400, { erros }];
    const email = corpo.email.trim().toLowerCase();
    if (db.prepare('SELECT 1 FROM clientes WHERE email = ? AND id <> ?').get(email, id)) {
      return [409, { erro: 'E-mail já cadastrado para outro cliente' }];
    }
    db.prepare(`
      UPDATE clientes
         SET nome = ?, email = ?, senha = ?, cep = ?, rua = ?, numero = ?,
             complemento = ?, bairro = ?, cidade = ?, estado = ?
       WHERE id = ?
    `).run(corpo.nome.trim(), email, gerarHashSenha(corpo.senha), ...enderecoParaColunas(corpo.endereco), id);
    const linha = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    return [200, clienteParaJson(linha)];
  }],

  // Usado pela cesta para conferir o cupom antes de comprar. O desconto de verdade é calculado ao gravar o pedido.
  ['POST', /^\/api\/cupons\/validar$/, (corpo) => {
    const cupom = buscarCupom(corpo.codigo);
    return cupom ? [200, { codigo: cupom.codigo, percentual: cupom.percentual }] : [404, { erro: 'Cupom inválido ou expirado' }];
  }],

  // ---------- cupons (cadastro) ----------
  // Os pedidos já feitos guardam o código e o desconto da hora da compra: apagar ou mudar o cupom não os altera.

  ['GET', /^\/api\/cupons$/, () => [200, db.prepare('SELECT * FROM cupons ORDER BY codigo').all().map(cupomParaJson)]],

  ['GET', /^\/api\/cupons\/([^/]+)$/, (_, codigo) => {
    const linha = cupomPorCodigo(codigo);
    return linha ? [200, cupomParaJson(linha)] : [404, { erro: 'Cupom não encontrado' }];
  }],

  ['POST', /^\/api\/cupons$/, criarCupom],

  ['PUT', /^\/api\/cupons\/([^/]+)$/, (corpo, codigo) => alterarCupom(codigo, corpo)],

  ['DELETE', /^\/api\/cupons\/([^/]+)$/, (_, codigo) => {
    const { changes } = db.prepare('DELETE FROM cupons WHERE codigo = ?').run(String(codigo).trim().toUpperCase());
    return changes ? [200, 'Cupom removido com sucesso!'] : [404, { erro: 'Cupom não encontrado' }];
  }],

  // ---------- pedidos (rotas do site, em JSON) ----------

  ['GET', /^\/api\/pedidos$/, (_, __, consulta) => {
    const clienteId = consulta.get('clienteId');
    const linhas = clienteId === null
      ? db.prepare('SELECT * FROM pedidos ORDER BY id').all()
      : db.prepare('SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY id').all(Number(clienteId));
    return [200, linhas.map(pedidoParaJson)];
  }],

  ['GET', /^\/api\/pedidos\/(\d+)$/, (_, id) => {
    const linha = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    return linha ? [200, pedidoParaJson(linha)] : [404, { erro: 'Pedido não encontrado' }];
  }],

  ['POST', /^\/api\/pedidos$/, criarPedido],

  // ---------- contrato do professor: produto ----------

  ['GET', /^\/api\/produto\/vitrine$/, () => {
    // Vitrine = lançamentos e produtos em promoção.
    const linhas = db.prepare('SELECT * FROM produtos WHERE novo = 1 OR preco_antigo IS NOT NULL ORDER BY id').all();
    return [200, linhas.map(produtoContrato)];
  }],

  ['GET', /^\/api\/produto\/busca\/([^/]+)$/, (_, termo) => {
    const padrao = `%${termo}%`;
    const linhas = db.prepare('SELECT * FROM produtos WHERE nome LIKE ? OR descricao LIKE ? ORDER BY id').all(padrao, padrao);
    return [200, linhas.map(produtoContrato)];
  }],

  ['GET', /^\/api\/produto\/(\d+)$/, (_, id) => {
    const linha = produtoPorId(id);
    return [200, linha ? produtoContrato(linha) : {}];
  }],

  ['POST', /^\/api\/produto$/, (corpo) => {
    const resposta = criarProduto(produtoDoContrato(corpo));
    return comoTexto(resposta, 'Produto gravado com sucesso!');
  }],

  ['PUT', /^\/api\/produto$/, (corpo) => {
    const atual = Number.isInteger(corpo.codigo) ? produtoPorId(corpo.codigo) : undefined;
    if (!atual) return [404, 'Produto não encontrado!'];
    const dados = { ...produtoParaJson(atual), ...produtoDoContrato({ ...corpo, nome: corpo.nome ?? corpo.descricao ?? atual.nome,
      categoria: corpo.categoria ?? atual.categoria, imagem: corpo.imagem ?? atual.imagem,
      tamanhos: corpo.tamanhos ?? JSON.parse(atual.tamanhos), preco: corpo.preco ?? corpo.valor ?? atual.preco }) };
    const erros = validarProduto(dados);
    if (erros.length) return [400, { erros }];
    db.prepare(`
      UPDATE produtos
         SET nome = ?, categoria = ?, imagem = ?, fotos = ?, tamanhos = ?, preco = ?, preco_antigo = ?, novo = ?, descricao = ?
       WHERE id = ?
    `).run(dados.nome.trim(), dados.categoria.trim(), dados.imagem, dados.fotos ? JSON.stringify(dados.fotos) : null,
           JSON.stringify(dados.tamanhos), dados.preco, dados.precoAntigo ?? null, dados.novo ? 1 : 0,
           corpo.nome === undefined && corpo.descricao !== undefined ? atual.descricao : dados.descricao ?? null, atual.id);
    return [200, `Produto alterado com sucesso! ${atual.id}`];
  }],

  ['DELETE', /^\/api\/produto\/(\d+)$/, (_, id) => removerPorId('produtos', id, 'Produto')],

  // O contrato lista os produtos em /api/produtos, a mesma rota que o site usa (formato do site).

  // ---------- contrato do professor: cliente ----------

  ['GET', /^\/api\/cliente\/(\d+)$/, (_, id) => {
    const linha = clientePorId(id);
    return [200, linha ? clienteParaJson(linha) : {}];
  }],

  ['POST', /^\/api\/cliente$/, (corpo) => comoTexto(criarCliente(corpo), 'Cliente gravado com sucesso!')],

  ['PUT', /^\/api\/cliente$/, (corpo) => {
    const resposta = alterarClienteDoContrato(corpo);
    return comoTexto(resposta, 'Cliente alterado com sucesso!', corpo.codigo);
  }],

  ['DELETE', /^\/api\/cliente\/(\d+)$/, (_, id) => removerPorId('clientes', id, 'Cliente')],

  ['POST', /^\/api\/cliente\/login$/, (corpo) => {
    if (!texto(corpo.email) || !texto(corpo.senha)) return [200, {}];
    const linha = db.prepare('SELECT * FROM clientes WHERE email = ?').get(corpo.email.trim().toLowerCase());
    return [200, linha && senhaConfere(corpo.senha, linha.senha) ? clienteParaJson(linha) : {}];
  }],

  ['PATCH', /^\/api\/cliente\/resetarSenha$/, (corpo) => {
    const [status, resposta] = definirSenha(corpo.email, SENHA_RESETADA);
    return status === 200 ? [200, 'Sua senha foi reiniciada, verifique o seu email!'] : [status, resposta.erro];
  }],

  ['PATCH', /^\/api\/cliente\/alterarSenha$/, (corpo) => {
    if (!texto(corpo.documento)) return [400, 'documento é obrigatório'];
    const [status, resposta] = definirSenha(corpo.email, corpo.senha, corpo.documento);
    return status === 200 ? [200, 'Sua senha foi alterada, verifique o seu email!'] : [status, resposta.erro];
  }],

  // ---------- contrato do professor: pedido ----------

  ['GET', /^\/api\/pedido\/(\d+)$/, (_, id) => {
    const linha = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    return [200, linha ? pedidoParaJson(linha) : {}];
  }],

  ['POST', /^\/api\/pedido$/, (corpo) => {
    const resposta = criarPedido(corpo);
    return comoTexto(resposta, 'Pedido gravado com sucesso!', resposta[1].codigoPedido);
  }],

  ['PUT', /^\/api\/pedido$/, (corpo) => {
    const resposta = alterarPedido(corpo);
    return comoTexto(resposta, 'Pedido alterado com sucesso!', corpo.codigoPedido);
  }],

  ['DELETE', /^\/api\/pedido\/(\d+)$/, (_, id) => removerPorId('pedidos', id, 'Pedido')],
];

// ---------- servidor ----------

function responder(res, status, corpo) {
  // Texto puro nas respostas do contrato do professor ("Produto gravado com sucesso! 1"); o resto é JSON.
  const ehTexto = typeof corpo === 'string';
  res.writeHead(status, {
    'Content-Type': ehTexto ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(corpo === undefined ? '' : ehTexto ? corpo : JSON.stringify(corpo, null, 2));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let dados = '';
    req.setEncoding('utf8');
    req.on('data', parte => { dados += parte; });
    req.on('end', () => {
      if (dados.trim() === '') return resolve({});
      try { resolve(JSON.parse(dados)); } catch { reject(new Error('JSON inválido no corpo da requisição')); }
    });
    req.on('error', reject);
  });
}

const servidor = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return responder(res, 204);

  const url = new URL(req.url, 'http://localhost');
  const caminho = url.pathname.replace(/\/+$/, '') || '/';
  const doCaminho = rotas.filter(([, padrao]) => padrao.test(caminho));
  if (doCaminho.length === 0) return responder(res, 404, { erro: 'Rota não encontrada' });

  const rota = doCaminho.find(([metodo]) => metodo === req.method);
  if (!rota) return responder(res, 405, { erro: `Método ${req.method} não permitido em ${caminho}` });

  try {
    const corpo = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await lerCorpo(req) : {};
    if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
      return responder(res, 400, { erro: 'O corpo deve ser um objeto JSON' });
    }
    // O que a rota captura na URL: número vira número ({id}); texto ({termo}) é decodificado.
    const capturado = caminho.match(rota[1])[1];
    const parametro = capturado === undefined ? undefined
      : /^\d+$/.test(capturado) ? Number(capturado) : decodeURIComponent(capturado);
    const [status, resposta] = rota[2](corpo, parametro, url.searchParams);
    responder(res, status, resposta);
  } catch (erro) {
    const ehJson = erro.message.startsWith('JSON inválido');
    responder(res, ehJson ? 400 : 500, { erro: ehJson ? erro.message : 'Erro interno no servidor' });
    if (!ehJson) console.error(erro);
  }
});

servidor.listen(PORTA, () => {
  console.log(`API Pixel Threads rodando em http://localhost:${PORTA}`);
  console.log(`Banco de dados: ${ARQUIVO_BANCO}`);
});
