# Autenticação, sessão e cadastro (TF02 – itens 4 e 5)

API em **Node + Express** que usa o Model do Membro 1 (`src/model`).

## Como rodar

1. Banco criado com `sql/schema.sql` e `.env` preenchido (veja `.env.example`; agora tem também `PORT`, `FRONTEND_URL` e `SESSION_SECRET`).
2. `npm install`
3. Criar um administrador (o enunciado permite inserir direto no banco):
   `npm run criar-admin -- admin admin123 "Administrador"`
4. `npm start` → API em http://localhost:3001
5. Testes: `npm run teste-auth` (cria dados de teste e apaga no final; deve terminar com `Tudo funcionou!`)

O React roda em http://localhost:3000 e chama esta API (o CORS já está liberado para essa origem).

## Rotas

| Método e rota | Quem acessa | O que faz |
|---|---|---|
| `POST /api/clientes` | público | Cadastra cliente. Corpo: `nome, login, email, senha, endereco` (opcionais: `telefone, formaPagamento`). `201` ok · `400` dados inválidos (com `erros` por campo) · `409` login já em uso |
| `POST /api/auth/login` | público | Corpo: `{ login, senha }`. Cria a sessão e devolve `{ id, nome, perfil }` (`CLIENTE` ou `ADMIN`). `401` se usuário ou senha estiverem errados |
| `POST /api/auth/logout` | qualquer um | Encerra a sessão |
| `GET /api/auth/me` | quem tem sessão | Diz quem está logado (`401` se ninguém) |
| `GET /api/clientes/me` | só CLIENTE | Dados do próprio cliente |
| `GET /api/admin/me` | só ADMIN | Dados do próprio administrador |

Cliente tentando rota de admin (e vice-versa) recebe **403**; sem sessão recebe **401**.

## Para o Membro 3 (editar e excluir o cadastro do cliente)

Crie as rotas em `src/routes/index.js` protegidas com `exigirCliente`. O id do usuário vem **da sessão**, nunca do corpo ou da URL, assim um cliente não consegue mexer na conta de outro:

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

(Valide os campos como em `src/utils/validacao.js` antes de salvar.)

## Decisões e cuidados

- **Senha**: guardada com `bcryptjs`; nunca é devolvida ao front-end.
- **Perfil** vem do banco (`Usuario.buscarPorLogin`), nunca do que o navegador envia. O cadastro público sempre cria `CLIENTE`.
- **Sessão**: `express-session` com cookie `httpOnly` e `sameSite=lax`, válida por 2 h, id renovado a cada login. Fica na memória do servidor: ao reiniciar a API todos precisam logar de novo.
- **Mensagem de login** é a mesma para usuário inexistente e senha errada.
- `SESSION_SECRET` deve ser definido no `.env` (em produção é obrigatório).
