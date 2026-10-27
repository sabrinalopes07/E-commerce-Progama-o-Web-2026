# E-commerce - Programação para Web I

Projeto final da disciplina (UFC). Stack: **React** (front-end), **Node.js** (back-end) e **MySQL** (banco).

Este repositório contém, por enquanto, o **banco de dados** e a **camada Model** (TF02).

## Como rodar na sua máquina

1. **Instale** o [Node.js](https://nodejs.org) (versão LTS) e o MySQL (com o Workbench).
2. **Crie o banco:** abra `sql/schema.sql` no MySQL Workbench e execute o script inteiro (raio ⚡).
   Para recomeçar do zero: `DROP DATABASE ecommerce;` e rode o script de novo.
3. **Configure o acesso:** copie `.env.example` para `.env` e coloque a senha do seu MySQL.
   O arquivo `.env` é pessoal e **não vai para o GitHub**.
4. **Instale as bibliotecas:** `npm install`
5. **Teste:** `node teste-model.js`. Deve terminar com `Tudo funcionou!`.

## Estrutura

```
sql/schema.sql        Script que cria o banco e as 7 tabelas
src/model/            Camada Model (acesso ao banco)
  db.js               Conexão com o MySQL (pool)
  Usuario.js          Operações comuns de usuário (login, atualizar, excluir)
  Cliente.js          Cadastro e manutenção de clientes
  Administrador.js    Dados do administrador
  Categoria.js        CRUD de categorias
  Produto.js          CRUD de produtos e lista da página inicial
  Venda.js            Compra (valida e baixa estoque) e histórico
  index.js            Exporta tudo junto
teste-model.js        Teste automático das classes
```

## Como usar o Model

```js
const { Cliente, Usuario, Produto } = require('./src/model');
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

Todas as funções são `async`: use `await`.

## Regras importantes

- **Senha:** o banco guarda o **hash**, nunca a senha digitada. Quem recebe a senha (cadastro e login)
  usa `bcryptjs` (`npm install bcryptjs`): `bcrypt.hash(senha, 10)` ao cadastrar e
  `bcrypt.compare(senha, usuario.senha)` ao logar.
- **Nunca envie o objeto de `buscarPorLogin` inteiro ao front-end**, pois ele contém o hash da senha.
- **Login repetido:** `Cliente.criar` lança um erro com `err.code === 'ER_DUP_ENTRY'`. Trate e avise o usuário.
- **Perfis:** quem está em `adm` é administrador; quem está em `cliente` é cliente. Use `perfil`
  para bloquear o acesso cruzado entre as áreas.

## Modelo de dados

`usuario` (dados comuns) é especializado em `adm` e `cliente` (mesmo `id`).
`categoria` 1:N `produto`. `cliente` 1:N `venda`. `venda` N:N `produto` por meio de `venda_produto`
(que guarda o preço e a quantidade no momento da compra).
