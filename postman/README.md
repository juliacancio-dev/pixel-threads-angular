# Atividade: API da Lojinha com Postman

Objetivo da atividade, usando a API `lojinha` do professor:

1. Inserir 10 produtos com **POST**
2. Inserir 2 clientes com **POST**
3. Alterar os dados de um cliente com **PUT**
4. Consultar os produtos com **GET**

A collection [`lojinha-api.postman_collection.json`](lojinha-api.postman_collection.json) já tem todas essas requisições prontas e na ordem certa.

---

## O que você precisa

- **Java 21 ou maior.** Para conferir, abra o terminal e rode `java -version`.
- **Postman**, instalado ou pelo navegador em https://web.postman.co.
  - O Postman pelo navegador **não acessa `localhost`** sem o *Postman Desktop Agent*. Se for usar a API local, prefira o Postman instalado.
- Internet na primeira execução, para o Maven baixar as dependências.

Não precisa instalar Maven: o projeto vem com o Maven Wrapper (`mvnw`).

---

## Passo 1: Baixar a API

1. Baixe o `lojinha.zip`:
   https://github.com/professorNortonGlaser/desenvolvimentoWeb/blob/main/lojinha.zip
   Na página, use o botão de download (ícone de seta), à direita.
2. Descompacte em uma pasta **fora deste repositório**, por exemplo `C:\lojinha` ou `~/lojinha`.
3. Entre na pasta do projeto, onde fica o `pom.xml`. Fica dentro de `lojinha\lojinha`.

## Passo 2: Subir a API

**Windows (PowerShell ou CMD):**
```bat
cd C:\lojinha\lojinha\lojinha
mvnw.cmd spring-boot:run
```

**Linux, Mac ou Codespaces:**
```bash
cd ~/lojinha/lojinha/lojinha
chmod +x mvnw
./mvnw spring-boot:run
```

A primeira execução demora alguns minutos. A API está no ar quando aparecer no terminal:

```
Tomcat started on port 8081
```

**Deixe esse terminal aberto.** Se fechar, a API para.

Para testar, abra no navegador: http://localhost:8081/api/produtos. Deve aparecer uma lista em JSON, que pode estar vazia: `[]`.

## Passo 3: Importar a collection no Postman

1. No Postman, clique em **Import** e escolha o arquivo `postman/lojinha-api.postman_collection.json` deste repositório.
2. Clique na collection **"Lojinha API - Atividade"** e abra a aba **Variables**.
3. Confira a variável `baseUrl`:
   - API rodando no notebook: `http://localhost:8081` (já é o padrão)
   - API rodando no Codespaces: a URL da porta 8081, sem `/` no final (veja a seção sobre Codespaces no fim deste documento)
4. Clique em **Save**.

## Passo 4: Rodar as requisições

### Jeito mais fácil: tudo de uma vez

1. Clique com o botão direito na collection e escolha **Run collection**.
2. Clique em **Run Lojinha API - Atividade**.
3. Todos os testes devem aparecer em verde.

### Uma por uma (bom para tirar print de cada etapa)

Abra as pastas **nesta ordem** e clique em **Send** em cada requisição:

| Pasta | O que faz | Resposta esperada |
|---|---|---|
| **1. Produtos - POST** | 10 requisições, uma por produto | `Produto gravado com sucesso! N` |
| **2. Clientes - POST** | Cadastra Ana Souza e Bruno Lima | `Cliente gravado com sucesso! N` |
| **3. Cliente - PUT** | Altera nome, telefone, endereço e e-mail da Ana | `Cliente alterado com sucesso! N` |
| | GET de conferência | JSON da Ana com os dados novos |
| **4. Produtos - GET** | Lista todos os produtos | Lista JSON com os 10 produtos |
| | Produto por código e vitrine | Extras para mostrar mais consultas |

**A ordem importa.** O POST da Ana guarda o código dela na variável `clienteCodigo`, e o PUT usa esse código. Se rodar o PUT antes do POST, a resposta será `Cliente não encontrado!`.

---

## Campos usados

Os campos seguem as classes `Produto.java` e `Cliente.java` do projeto, que são diferentes dos exemplos do PDF.

**Produto:** `nome`, `descritivo`, `valor`, `valorPromo`, `quantidade`, `destaque`. O `codigo` é gerado pela API.
- `destaque` maior que 0 faz o produto aparecer na vitrine (`/api/produto/vitrine`).

**Cliente:** `nome`, `telefone`, `documento`, `senha`, `logradouro`, `email`, `ativo`. O `codigo` é gerado pela API.

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `java` não é reconhecido, ou a versão é menor que 21 | Instale ou use um Java 21 |
| `Port 8081 was already in use` | Já existe outra instância da API rodando. Feche o outro terminal. |
| Postman mostra `ECONNREFUSED` ou `Could not send request` | A API não está rodando, ou o `baseUrl` está errado |
| PUT responde `Cliente não encontrado!` | Rode antes o POST do Cliente 01, ou ajuste a variável `clienteCodigo` para um código que exista |
| Depois do PUT, alguns campos do cliente ficaram vazios | O PUT substitui o cadastro inteiro. Envie todos os campos no corpo. |
| Produtos ou clientes aparecem repetidos | Cada vez que a collection roda, ela insere tudo de novo. Para zerar, pare a API e apague o arquivo `lojinha.db`; ele é recriado vazio. |
| `bad interpreter` ou `^M` (Linux, Mac ou Codespaces) | Rode `sed -i 's/\r$//' mvnw` e tente de novo |

---

## Alternativa: GitHub Codespaces

Use esta opção se não tiver um computador com Java. Ela depende de o Codespaces estar liberado na conta, ou seja, de o budget não estar como "Usage blocked" em https://github.com/settings/billing/budgets.

1. Neste repositório, clique em **Code**, vá na aba **Codespaces** e clique em **Create codespace on main**.
2. No terminal do Codespace:
   ```bash
   mkdir -p ~/lojinha && cd ~/lojinha
   curl -L -o lojinha.zip https://raw.githubusercontent.com/professorNortonGlaser/desenvolvimentoWeb/main/lojinha.zip
   unzip lojinha.zip
   cd lojinha/lojinha
   java -version   # se não for 21+, rode: sdk install java 21-tem  (ou escolha uma versão em: sdk list java)
   chmod +x mvnw
   ./mvnw spring-boot:run
   ```
3. Na aba **Ports**, clique com o botão direito na porta **8081**, vá em **Port Visibility** e escolha **Public**. Depois copie o endereço, algo como `https://xxxx-8081.app.github.dev`.
4. No Postman, use esse endereço como `baseUrl` e siga a partir do Passo 4.
5. Quando terminar, pare o Codespace ou volte a porta para privada.
