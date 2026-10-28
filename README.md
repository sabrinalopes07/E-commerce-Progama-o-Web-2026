# E-commerce - Programação para Web I

Projeto final da disciplina. Stack: **React** (front-end), **Node.js + Express** (back-end) e **MySQL** (banco).

```
/                       Front-end (React + Tailwind)
  src/Telas             Telas (login, cadastro, edição de usuário, modais)
  src/services/api.js   Chamadas à API (com o cookie de sessão)
  src/utils             Validação dos formulários no navegador
/backend                Back-end
  sql/schema.sql        Cria o banco e as 7 tabelas
  src/model             Camada Model: acesso ao banco (Membro 1)
  src/routes            Rotas da API
  src/controllers       Lógica de cada rota (cadastro, login, ...)
  src/middleware        Controle de acesso por sessão e perfil
  src/utils             Validação dos dados no servidor
  scripts/criar-admin.js  Cria um administrador direto no banco
  teste-model.js, teste-auth.js  Testes automáticos
```

## Como rodar (3 passos, cada um num terminal)

**1. Banco de dados (uma vez)**
Abra `backend/sql/schema.sql` no MySQL Workbench e execute o script inteiro.
Para recomeçar do zero: `DROP DATABASE ecommerce;` e rode o script de novo.

**2. Back-end** (porta 3001)
```bash
cd backend
cp .env.example .env     # abra o .env e coloque a senha do seu MySQL e um SESSION_SECRET
npm install
npm run criar-admin -- admin admin123 "Administrador"   # cria um administrador (uma vez)
npm start
```
O `.env` é pessoal e **não vai para o GitHub**.

**3. Front-end** (porta 3000)
```bash
# na raiz do projeto
npm install
npm start
```

Abra http://localhost:3000. Para cadastrar um cliente use "Não possui conta? Crie uma"; para testar o administrador entre com o usuário criado no passo 2.

## Testes do back-end

```bash
cd backend
npm run teste-model   # banco + classes do Model
npm run teste-auth    # cadastro, login, logout e acesso por perfil
```
Os dois devem terminar com `Tudo funcionou!`. Eles criam dados de teste e apagam no final.

## Rotas da API

| Rota | Quem acessa | O que faz |
|---|---|---|
| `POST /api/clientes` | público | Cadastra cliente. Corpo: `nome, login, email, senha, endereco` (opcionais: `telefone, formaPagamento`). `201` ok · `400` dados inválidos (com `erros` por campo) · `409` login já em uso |
| `POST /api/auth/login` | público | Corpo: `{ login, senha }`. Cria a sessão e devolve `{ id, nome, perfil }` (`CLIENTE` ou `ADMIN`). `401` se usuário ou senha estiverem errados |
| `POST /api/auth/logout` | qualquer um | Encerra a sessão |
| `GET /api/auth/me` | quem tem sessão | Diz quem está logado (`401` se ninguém) |
| `GET /api/clientes/me` | só CLIENTE | Dados do próprio cliente |
| `GET /api/admin/me` | só ADMIN | Dados do próprio administrador |

Sem sessão a resposta é **401**; perfil errado (cliente em rota de admin e vice-versa) é **403**.

## Como usar o Model (`backend/src/model`)

```js
const { Cliente, Usuario, Produto } = require('./model');
```

| Função | O que faz |
|---|---|
| `Cliente.criar({ nome, endereco, email, telefone, login, senhaHash, formaPagamento })` | Cadastra cliente (cria `usuario` + `cliente`). Devolve o id |
| `Usuario.buscarPorLogin(login)` | Busca para o login. Devolve o usuário com `senha` (hash) e `perfil` (`'ADMIN'` ou `'CLIENTE'`) |
| `Usuario.loginExiste(login)` | `true` se o login já está em uso |
| `Cliente.buscarPorId(id)` | Dados do cliente |
| `Cliente.atualizar(id, { nome, endereco, email, telefone, login, senhaHash, formaPagamento })` | Altera só os campos enviados |
| `Cliente.excluir(id)` | Exclui o cadastro (apaga também as compras dele) |
| `Produto.listarEmEstoque()` | Produtos com quantidade > 0 (página inicial) |

Todas as funções são `async`: use `await`. Também existem `Administrador`, `Categoria` e `Venda` (veja os arquivos em `src/model`).

## Regras importantes

- **Senha:** o banco guarda o **hash** (`bcryptjs`), nunca a senha digitada. Use `bcrypt.hash(senha, 10)` ao cadastrar e `bcrypt.compare(senha, usuario.senha)` ao logar.
- **Nunca envie o objeto de `Usuario.buscarPorLogin` inteiro ao front-end:** ele contém o hash da senha.
- **Perfil:** vem do banco (quem está em `adm` é administrador; quem está em `cliente` é cliente), nunca do que o navegador envia. O cadastro público sempre cria `CLIENTE`; administradores são inseridos direto no banco (`npm run criar-admin`).
- **Sessão:** `express-session` com cookie `httpOnly`, `sameSite=lax`, válida por 2 h, com id renovado a cada login. Fica na memória do servidor: ao reiniciar a API todos precisam logar de novo.
- **Mensagem de login** é a mesma para usuário inexistente e senha errada.
- **Login repetido:** `Cliente.criar` lança erro com `err.code === 'ER_DUP_ENTRY'` (a API responde 409).

## Criando novas rotas protegidas (ex.: editar e excluir o cadastro do cliente)

Em `backend/src/routes/index.js`, proteja a rota com `exigirCliente` (só cliente), `exigirAdmin` (só administrador) ou `exigirLogin` (qualquer um logado). O id do usuário vem **da sessão**, nunca do corpo ou da URL; assim um cliente não consegue mexer na conta de outro.

```js
const { exigirCliente, destruirSessao } = require('../middleware/auth');
const { Cliente } = require('../model');
const bcrypt = require('bcryptjs');

router.put('/clientes/me', exigirCliente, async (req, res) => {
  const { nome, endereco, email, telefone, senha, formaPagamento } = req.body;
  const dados = { nome, endereco, email, telefone, formaPagamento };
  if (senha) dados.senhaHash = await bcrypt.hash(senha, 10);
  await Cliente.atualizar(req.session.usuario.id, dados);
  res.json({ mensagem: 'Dados atualizados.' });
});

router.delete('/clientes/me', exigirCliente, async (req, res) => {
  await Cliente.excluir(req.session.usuario.id);
  await destruirSessao(req, res); // encerra a sessão depois de excluir a conta
  res.json({ mensagem: 'Cadastro excluído.' });
});
```
Valide os campos como em `backend/src/utils/validacao.js` antes de salvar.

## Modelo de dados

`usuario` (dados comuns) é especializado em `adm` e `cliente` (mesmo `id`).
`categoria` 1:N `produto`. `cliente` 1:N `venda`. `venda` N:N `produto` por meio de `venda_produto`
(que guarda o preço e a quantidade no momento da compra).
