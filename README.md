# E-commerce - Programação para Web I

Projeto final da disciplina. Stack: **React** (front-end), **Node.js + Express** (back-end) e **MySQL** (banco).

```
/                 Front-end (React + Tailwind). Telas em src/Telas, chamadas à API em src/services/api.js
/backend          Back-end: API Express, sessão de usuário e camada Model (MySQL)
  sql/schema.sql  Script que cria o banco e as 7 tabelas
  src/model       Camada Model (Membro 1)
  src/            Rotas, controllers e middlewares de login/sessão/cadastro (Membro 2)
```

## Como rodar (3 passos, cada um num terminal)

**1. Banco de dados (uma vez)**
Abra `backend/sql/schema.sql` no MySQL Workbench e execute o script inteiro.

**2. Back-end** (porta 3001)
```bash
cd backend
cp .env.example .env     # abra o .env e coloque a senha do seu MySQL e um SESSION_SECRET
npm install
npm run criar-admin -- admin admin123 "Administrador"   # cria um administrador (uma vez)
npm start
```

**3. Front-end** (porta 3000)
```bash
# na raiz do projeto
npm install
npm start
```

Abra http://localhost:3000. Para cadastrar um cliente use a tela "Crie uma"; para testar o administrador entre com o usuário criado no passo 2.

## Testes do back-end

```bash
cd backend
npm run teste-model   # banco + classes do Model
npm run teste-auth    # cadastro, login, logout e acesso por perfil
```

Mais detalhes: `backend/README.md` (Model) e `backend/README-AUTENTICACAO.md` (rotas, sessão e perfis).
