const express = require('express');
const { exigirCliente, exigirAdmin } = require('../middleware/auth');
const auth = require('../controllers/authController');
const clientes = require('../controllers/clienteController');
const admin = require('../controllers/adminController');

const router = express.Router();

// ----- Públicas (não precisam de sessão) -----
router.post('/clientes', clientes.cadastrar); // cadastro de novo cliente
router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', auth.me);

// ----- Área exclusiva do CLIENTE -----
router.get('/clientes/me', exigirCliente, clientes.meusDados);
router.put('/clientes/me', exigirCliente, clientes.atualizar); // alterar dados pessoais
router.delete('/clientes/me', exigirCliente, clientes.excluir); // excluir o próprio cadastro

// ----- Área exclusiva do ADMINISTRADOR -----
router.get('/admin/me', exigirAdmin, admin.meusDados);

module.exports = router;
