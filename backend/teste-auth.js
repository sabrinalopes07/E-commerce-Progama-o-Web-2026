// Teste de cadastro, login, logout e controle de acesso por perfil.
// Rode com: npm run teste-auth   (precisa do MySQL ligado e do .env configurado)
// Cria um cliente e um admin de teste e apaga tudo no final.
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const app = require('./src/app');
const { pool, Usuario } = require('./src/model');

let base;
let falhas = 0;

// Mini "navegador": guarda o cookie de sessão entre as requisições
function criarNavegador() {
  let cookie = '';
  return async function chamar(metodo, caminho, corpo) {
    const res = await fetch(base + caminho, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    let json = null;
    try { json = await res.json(); } catch { /* sem corpo */ }
    return { status: res.status, json, setCookie };
  };
}

async function passo(descricao, fn) {
  try {
    await fn();
    console.log('  ok  ', descricao);
  } catch (err) {
    falhas++;
    console.log('  FALHOU', descricao, '\n        ', err.message.split('\n')[0]);
  }
}

async function main() {
  const servidor = app.listen(0);
  base = `http://127.0.0.1:${servidor.address().port}`;

  const sufixo = Date.now();
  const loginCliente = 'cli_' + sufixo;
  const loginAdmin = 'adm_' + sufixo;
  const senha = 'senha123';
  const dadosCliente = {
    nome: 'Maria da Silva', endereco: 'Rua das Flores, 100', email: 'maria@teste.com',
    login: loginCliente, senha, formaPagamento: 'PIX',
  };
  let idAdmin;

  // Cria um admin direto no banco (como o enunciado permite)
  const hash = await bcrypt.hash(senha, 10);
  const [r] = await pool.query(
    'INSERT INTO usuario (nome, endereco, email, login, senha) VALUES (?, ?, ?, ?, ?)',
    ['Admin Teste', 'Sede', 'adm@teste.com', loginAdmin, hash]
  );
  idAdmin = r.insertId;
  await pool.query('INSERT INTO adm (id) VALUES (?)', [idAdmin]);

  const anonimo = criarNavegador();
  const cliente = criarNavegador();
  const admin = criarNavegador();

  try {
    console.log('\n[Cadastro de cliente]');
    await passo('campos faltando -> 400 com erros por campo', async () => {
      const r = await anonimo('POST', '/api/clientes', { nome: 'A' });
      assert.equal(r.status, 400);
      assert.ok(r.json.erros.nome && r.json.erros.email && r.json.erros.login && r.json.erros.senha && r.json.erros.endereco);
    });
    await passo('e-mail inválido -> 400', async () => {
      const r = await anonimo('POST', '/api/clientes', { ...dadosCliente, email: 'naoemail' });
      assert.equal(r.status, 400);
      assert.ok(r.json.erros.email);
    });
    await passo('senha curta -> 400', async () => {
      const r = await anonimo('POST', '/api/clientes', { ...dadosCliente, senha: '123' });
      assert.equal(r.status, 400);
      assert.ok(r.json.erros.senha);
    });
    await passo('cadastro válido -> 201 e não devolve senha', async () => {
      const r = await anonimo('POST', '/api/clientes', dadosCliente);
      assert.equal(r.status, 201);
      assert.ok(r.json.id);
      assert.equal(JSON.stringify(r.json).includes('senha'), false);
    });
    await passo('senha salva como hash bcrypt (não em texto puro)', async () => {
      const u = await Usuario.buscarPorLogin(loginCliente);
      assert.notEqual(u.senha, senha);
      assert.ok(await bcrypt.compare(senha, u.senha));
      assert.equal(u.perfil, 'CLIENTE');
    });
    await passo('login repetido -> 409', async () => {
      const r = await anonimo('POST', '/api/clientes', dadosCliente);
      assert.equal(r.status, 409);
      assert.ok(r.json.erros.login);
    });
    await passo('enviar perfil=ADMIN no cadastro é ignorado (continua CLIENTE)', async () => {
      const l = 'hack_' + sufixo;
      const r = await anonimo('POST', '/api/clientes', { ...dadosCliente, login: l, perfil: 'ADMIN', administrador: true });
      assert.equal(r.status, 201);
      assert.equal((await Usuario.buscarPorLogin(l)).perfil, 'CLIENTE');
      await pool.query('DELETE FROM usuario WHERE login = ?', [l]);
    });

    console.log('\n[Login]');
    await passo('sem sessão: rotas privadas -> 401', async () => {
      assert.equal((await anonimo('GET', '/api/clientes/me')).status, 401);
      assert.equal((await anonimo('GET', '/api/admin/me')).status, 401);
      assert.equal((await anonimo('GET', '/api/auth/me')).status, 401);
    });
    await passo('senha errada -> 401 com mensagem genérica', async () => {
      const r = await anonimo('POST', '/api/auth/login', { login: loginCliente, senha: 'errada' });
      assert.equal(r.status, 401);
      assert.equal(r.json.erro, 'Usuário ou senha inválidos.');
    });
    await passo('usuário inexistente -> 401 com a MESMA mensagem', async () => {
      const r = await anonimo('POST', '/api/auth/login', { login: 'ninguem_' + sufixo, senha });
      assert.equal(r.status, 401);
      assert.equal(r.json.erro, 'Usuário ou senha inválidos.');
    });
    await passo('corpo vazio -> 400', async () => {
      assert.equal((await anonimo('POST', '/api/auth/login', {})).status, 400);
    });
    await passo('login do cliente -> 200, perfil CLIENTE, cookie httpOnly, sem hash', async () => {
      const r = await cliente('POST', '/api/auth/login', { login: loginCliente, senha });
      assert.equal(r.status, 200);
      assert.equal(r.json.perfil, 'CLIENTE');
      assert.equal(r.json.senha, undefined);
      assert.match(r.setCookie, /HttpOnly/i);
    });
    await passo('login do admin -> 200, perfil ADMIN', async () => {
      const r = await admin('POST', '/api/auth/login', { login: loginAdmin, senha });
      assert.equal(r.status, 200);
      assert.equal(r.json.perfil, 'ADMIN');
    });
    await passo('/auth/me devolve quem está logado', async () => {
      const r = await cliente('GET', '/api/auth/me');
      assert.equal(r.status, 200);
      assert.equal(r.json.nome, 'Maria da Silva');
    });

    console.log('\n[Acesso por perfil]');
    await passo('cliente acessa a área do cliente -> 200', async () => {
      const r = await cliente('GET', '/api/clientes/me');
      assert.equal(r.status, 200);
      assert.equal(r.json.login, loginCliente);
      assert.equal(r.json.senha, undefined);
    });
    await passo('cliente tenta área do ADMIN -> 403', async () => {
      assert.equal((await cliente('GET', '/api/admin/me')).status, 403);
    });
    await passo('admin acessa a área do admin -> 200', async () => {
      const r = await admin('GET', '/api/admin/me');
      assert.equal(r.status, 200);
      assert.equal(r.json.login, loginAdmin);
    });
    await passo('admin tenta área do CLIENTE -> 403', async () => {
      assert.equal((await admin('GET', '/api/clientes/me')).status, 403);
    });

    console.log('\n[Logout]');
    await passo('logout encerra a sessão: depois disso -> 401', async () => {
      assert.equal((await cliente('POST', '/api/auth/logout')).status, 200);
      assert.equal((await cliente('GET', '/api/clientes/me')).status, 401);
      assert.equal((await cliente('GET', '/api/auth/me')).status, 401);
    });
    await passo('logout sem sessão não dá erro', async () => {
      assert.equal((await anonimo('POST', '/api/auth/logout')).status, 200);
    });
    await passo('sessão do admin continua válida após logout do cliente', async () => {
      assert.equal((await admin('GET', '/api/admin/me')).status, 200);
    });
    await passo('conta excluída -> /auth/me deixa de valer', async () => {
      await pool.query('DELETE FROM usuario WHERE login = ?', [loginAdmin]);
      assert.equal((await admin('GET', '/api/auth/me')).status, 401);
    });
    await passo('rota inexistente -> 404 e JSON inválido -> 400', async () => {
      assert.equal((await anonimo('GET', '/api/nada')).status, 404);
      const res = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' });
      assert.equal(res.status, 400);
    });
  } finally {
    await pool.query('DELETE FROM usuario WHERE login IN (?, ?)', [loginCliente, loginAdmin]);
    servidor.close();
    await pool.end();
  }

  console.log(falhas === 0 ? '\nTudo funcionou!' : `\n${falhas} teste(s) falharam.`);
  process.exitCode = falhas === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('\nFalhou:', err);
  process.exitCode = 1;
});
