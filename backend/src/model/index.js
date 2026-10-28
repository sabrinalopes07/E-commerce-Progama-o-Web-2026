// Ponto único de importação: const { Cliente, Usuario } = require('./model');
module.exports = {
  pool: require('./db'),
  Usuario: require('./Usuario'),
  Cliente: require('./Cliente'),
  Administrador: require('./Administrador'),
  Categoria: require('./Categoria'),
  Produto: require('./Produto'),
  Venda: require('./Venda'),
};
