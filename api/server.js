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
`);

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
    nome: linha.nome,
    email: linha.email,
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
      'POST /api/login'
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

  ['POST', /^\/api\/produtos$/, (corpo) => {
    const erros = validarProduto(corpo);
    if (erros.length) return [400, { erros }];
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO produtos (nome, categoria, imagem, fotos, tamanhos, preco, preco_antigo, novo, descricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(corpo.nome.trim(), corpo.categoria.trim(), corpo.imagem,
           corpo.fotos ? JSON.stringify(corpo.fotos) : null, JSON.stringify(corpo.tamanhos),
           corpo.preco, corpo.precoAntigo ?? null, corpo.novo ? 1 : 0, corpo.descricao ?? null);
    const linha = db.prepare('SELECT * FROM produtos WHERE id = ?').get(lastInsertRowid);
    return [201, produtoParaJson(linha)];
  }],

  ['GET', /^\/api\/clientes$/, () => {
    const linhas = db.prepare('SELECT * FROM clientes ORDER BY id').all();
    return [200, linhas.map(clienteParaJson)];
  }],

  ['GET', /^\/api\/clientes\/(\d+)$/, (_, id) => {
    const linha = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    return linha ? [200, clienteParaJson(linha)] : [404, { erro: 'Cliente não encontrado' }];
  }],

  ['POST', /^\/api\/clientes$/, (corpo) => {
    const erros = validarCliente(corpo);
    if (erros.length) return [400, { erros }];
    const email = corpo.email.trim().toLowerCase();
    if (db.prepare('SELECT 1 FROM clientes WHERE email = ?').get(email)) {
      return [409, { erro: 'E-mail já cadastrado' }];
    }
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO clientes (nome, email, senha, cep, rua, numero, complemento, bairro, cidade, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(corpo.nome.trim(), email, gerarHashSenha(corpo.senha), ...enderecoParaColunas(corpo.endereco));
    const linha = db.prepare('SELECT * FROM clientes WHERE id = ?').get(lastInsertRowid);
    return [201, clienteParaJson(linha)];
  }],

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
  }]
];

// ---------- servidor ----------

function responder(res, status, corpo) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(corpo === undefined ? '' : JSON.stringify(corpo, null, 2));
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

  const caminho = new URL(req.url, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
  const doCaminho = rotas.filter(([, padrao]) => padrao.test(caminho));
  if (doCaminho.length === 0) return responder(res, 404, { erro: 'Rota não encontrada' });

  const rota = doCaminho.find(([metodo]) => metodo === req.method);
  if (!rota) return responder(res, 405, { erro: `Método ${req.method} não permitido em ${caminho}` });

  try {
    const corpo = req.method === 'POST' || req.method === 'PUT' ? await lerCorpo(req) : {};
    if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
      return responder(res, 400, { erro: 'O corpo deve ser um objeto JSON' });
    }
    const id = caminho.match(rota[1])[1];
    const [status, resposta] = rota[2](corpo, id === undefined ? undefined : Number(id));
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
