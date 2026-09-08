# PIXEL THREADS — Angular

E-commerce de roupas geek construído em Angular 18 (standalone components + Signals), migrado de um protótipo estático em HTML/JS para uma SPA com roteamento, formulários reativos e estado de carrinho reativo.

## Sumário

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Rotas](#rotas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Build de produção](#build-de-produção)
- [CI/CD](#cicd)

## Stack

- [Angular 18](https://angular.dev) — standalone components, Signals, Reactive Forms
- [RxJS](https://rxjs.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Karma](https://karma-runner.github.io) + [Jasmine](https://jasmine.github.io) — testes unitários

## Requisitos

- Node.js 20+ (recomendado 22.22.3+ ou 24+)
- npm 10+

## Como rodar

```bash
npm install
npm start
```

A aplicação abre em `http://localhost:4200`.

## Scripts disponíveis

| Comando         | Descrição                                                   |
| --------------- | ------------------------------------------------------------ |
| `npm start`      | Sobe o servidor de desenvolvimento em `localhost:4200`       |
| `npm run build`  | Gera o build de produção em `dist/pixel-threads-angular`     |
| `npm run watch`  | Build em modo desenvolvimento com rebuild automático         |
| `npm test`       | Executa os testes unitários (Karma + Jasmine) no navegador   |

## Rotas

| Caminho          | Página                          | Título da aba                                    |
| ----------------- | -------------------------------- | -------------------------------------------------- |
| `/`                | Home — vitrine de produtos       | PIXEL THREADS — Camisetas e produtos geek           |
| `/busca`           | Busca com filtros                | Buscar produtos — PIXEL THREADS                    |
| `/produto/:id`     | Detalhe do produto               | Produto — PIXEL THREADS                            |
| `/cesta`           | Carrinho de compras              | Minha cesta — PIXEL THREADS                        |
| `/login`           | Autenticação                     | Entrar — PIXEL THREADS                             |
| `/esqueci`         | Recuperação de senha             | Esqueci minha senha — PIXEL THREADS                |
| `**`               | Redireciona para `/`             | —                                                    |

## Estrutura do projeto

```
src/app/
├── components/
│   ├── header/          → cabeçalho, navegação, busca, badge da cesta
│   ├── footer/           → rodapé (varia entre home, páginas internas e auth)
│   └── toast/            → notificações (substitui o showToast do main.js original)
├── pages/
│   ├── home/             → vitrine de produtos + newsletter (era index.html)
│   ├── busca/             → busca com filtros funcionais (era busca.html)
│   ├── produto/           → detalhe do produto, galeria, abas (era produto.html)
│   ├── cesta/             → carrinho de compras (era cesta.html)
│   ├── login/             → login com Reactive Forms (era login.html)
│   └── esqueci/           → recuperação de senha (era esqueci.html)
├── services/
│   ├── produto.service.ts  → catálogo de produtos (mock, equivalente aos cards estáticos)
│   ├── cesta.service.ts    → estado do carrinho com Angular Signals
│   └── toast.service.ts    → mensagens de feedback
├── models/                → interfaces Produto e CartItem
├── app.routes.ts          → rotas da aplicação
└── app.config.ts          → configuração da aplicação (router, zone.js)
```

## Build de produção

```bash
npm run build
```

Os arquivos finais ficam em `dist/pixel-threads-angular/browser`, prontos para deploy em qualquer servidor de arquivos estáticos.

## CI/CD

O workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda automaticamente a cada `push`/`pull request` para a branch `main`:

1. Instala as dependências (`npm ci`)
2. Executa os testes unitários (`npm test -- --watch=false --browsers=ChromeHeadless`)
3. Gera o build de produção (`npm run build`)

Isso garante que nenhuma alteração quebre o build ou os testes antes de ser mesclada.
