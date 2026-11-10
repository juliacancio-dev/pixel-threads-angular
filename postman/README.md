# Atividade: API da Pixel Threads com Postman

Usando a API deste projeto (pasta [`api/`](../api/server.js)):

1. Inserir 10 produtos com **POST**
2. Inserir 2 clientes com **POST**
3. Alterar os dados de um cliente com **PUT**
4. Consultar os produtos com **GET**

A collection [`pixel-threads-api.postman_collection.json`](pixel-threads-api.postman_collection.json) tem todas essas requisições, na ordem certa.

**Banco de dados:** [`api/pixelthreads.db`](../api/pixelthreads.db) (SQLite), já com o resultado da atividade:
10 produtos e os clientes Ana Souza (com os dados alterados pelo PUT) e Bruno Lima.
O banco também tem o **Cliente Demo** (`cliente@pixelthreads.com` / `123456`), que a API cria sozinha para testar o login do site.

**O site usa este mesmo banco.** Os produtos da loja vêm da API, e quem se cadastra ou faz login no site é salvo e conferido no banco.
Para ver: rode `npm run api` num terminal e `npm start` em outro, e abra http://localhost:4200.

---

## O que você precisa

- **Node.js 24 ou maior.** Para conferir: `node -v`.
- **Postman** instalado. O Postman pelo navegador não acessa `localhost` sem o *Postman Desktop Agent*.

A API usa só o que já vem no Node (`node:http` e `node:sqlite`). Não precisa instalar nenhum pacote.

## Passo 1: Subir a API

Na pasta do projeto:

```bash
npm run api
```

A API está no ar quando aparecer:

```
API Pixel Threads rodando em http://localhost:3000
```

Deixe esse terminal aberto. Para testar, abra http://localhost:3000/api/produtos no navegador.

> O Node pode mostrar o aviso `ExperimentalWarning: SQLite is an experimental feature`. É normal, pode ignorar.

## Passo 2: Importar a collection

1. No Postman, clique em **Import** e escolha `postman/pixel-threads-api.postman_collection.json`.
2. Na collection **"Pixel Threads API - Atividade"**, aba **Variables**, confira se `baseUrl` é `http://localhost:3000`.

## Passo 3: Rodar as requisições

**Tudo de uma vez:** clique com o botão direito na collection e escolha **Run collection**. Todos os testes devem ficar verdes.

**Uma por uma** (bom para tirar print), nesta ordem:

| Pasta | O que faz | Resposta esperada |
|---|---|---|
| **1. Produtos - POST** | 10 camisetas do catálogo da loja | `201` com o produto e o `id` gerado |
| **2. Clientes - POST** | Cadastra Ana Souza e Bruno Lima | `201` com o cliente (sem a senha) |
| **3. Cliente - PUT** | Altera nome, e-mail e endereço da Ana | `200` com os dados novos |
| | GET de conferência | Ana com os dados novos |
| **4. Produtos - GET** | Lista todos os produtos | `200` com a lista de produtos |
| | Produto por id | `200` com o produto 1 |

**A ordem importa.** O POST da Ana guarda o `id` dela na variável `clienteId`, e o PUT usa esse `id`.

---

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/produtos` | Lista os produtos |
| GET | `/api/produtos/{id}` | Busca um produto |
| POST | `/api/produtos` | Cadastra um produto |
| GET | `/api/clientes` | Lista os clientes |
| GET | `/api/clientes/{id}` | Busca um cliente |
| POST | `/api/clientes` | Cadastra um cliente |
| PUT | `/api/clientes/{id}` | Altera um cliente (substitui o cadastro inteiro) |
| POST | `/api/clientes/existe` | Diz se um e-mail já tem conta (`{ "email": "..." }`) |
| POST | `/api/login` | Confere e-mail e senha (`{ "email": "...", "senha": "..." }`) |

**Produto** (mesmos campos de `src/app/models/produto.model.ts`):
`nome`, `categoria`, `imagem`, `fotos` (lista, opcional), `tamanhos` (lista), `preco`, `precoAntigo` (opcional), `novo`, `descricao`. O `id` é gerado pela API.

**Cliente** (mesmos campos de `src/app/models/usuario.model.ts`):
`nome`, `email`, `senha` (mínimo 6 caracteres) e `endereco` com `cep`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`. O `id` é gerado pela API. A senha é guardada criptografada (scrypt) e nunca volta nas respostas.

**Erros:** `400` (dados inválidos), `401` (e-mail ou senha incorretos), `404` (não encontrado), `409` (e-mail já cadastrado).

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `ECONNREFUSED` ou `Could not send request` | A API não está rodando (`npm run api`), ou o `baseUrl` está errado |
| `EADDRINUSE` (porta 3000 em uso) | Já tem outra API rodando. Feche o outro terminal, ou use outra porta (PowerShell: `$env:PORT=3001; npm run api`) e ajuste o `baseUrl` |
| POST de cliente responde `409 E-mail já cadastrado` | A collection já rodou antes. Veja a linha abaixo para zerar. |
| Quero zerar o banco | Pare a API e apague `api/pixelthreads.db`. Ele é recriado vazio quando a API sobe. |
