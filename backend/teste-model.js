// Teste das classes do Model. Rode com: node teste-model.js
// Cria dados de exemplo, confere se funcionam e apaga tudo no final.
const { pool, Categoria, Produto, Cliente, Usuario } = require('./src/model');

async function main() {
  const login = 'teste_' + Date.now(); // login único a cada execução

  console.log('1) Criando categoria...');
  const idCategoria = await Categoria.criar({ nome: 'Categoria Teste' });
  console.log('   id da categoria:', idCategoria);

  console.log('2) Criando produto...');
  const idProduto = await Produto.criar({
    descricao: 'Produto Teste', preco: 49.9, quantidade: 5, idCategoria,
  });
  console.log('   produto na página inicial:', (await Produto.listarEmEstoque()).map(p => p.descricao));

  console.log('3) Cadastrando cliente...');
  const idCliente = await Cliente.criar({
    nome: 'Maria Teste', endereco: 'Rua A, 123', email: 'maria@teste.com',
    login, senhaHash: 'hash_de_teste', formaPagamento: 'PIX',
  });
  console.log('   id do cliente:', idCliente);

  console.log('4) Buscando por login (como no login real)...');
  const u = await Usuario.buscarPorLogin(login);
  console.log('   achou:', u.nome, '| perfil:', u.perfil);

  console.log('5) Alterando dados do cliente...');
  await Cliente.atualizar(idCliente, { nome: 'Maria Alterada', formaPagamento: 'Cartão' });
  console.log('   depois:', await Cliente.buscarPorId(idCliente));

  console.log('6) Testando login repetido (deve dar erro)...');
  try {
    await Cliente.criar({ nome: 'X', endereco: 'Y', email: 'x@x.com', login, senhaHash: 'h' });
    console.log('   ERRO: deveria ter recusado!');
  } catch (err) {
    console.log('   recusado corretamente:', err.code);
  }

  console.log('7) Excluindo cliente...');
  await Cliente.excluir(idCliente);
  console.log('   ainda existe?', (await Cliente.buscarPorId(idCliente)) !== null);

  console.log('8) Limpando dados de teste...');
  await Produto.excluir(idProduto);
  await Categoria.excluir(idCategoria);

  console.log('\nTudo funcionou!');
}

main()
  .catch(err => console.error('\nFalhou:', err.message))
  .finally(() => pool.end());