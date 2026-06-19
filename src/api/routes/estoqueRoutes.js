'use strict';

const { Router } = require('express');
const estoqueController = require('../controllers/estoqueController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

const router = Router();

// Consultar saldo por unidade.
router.get('/', autenticar, estoqueController.consultar);

// Movimentar: somente admin, gerente ou atendente.
router.post('/movimentacoes', autenticar, autorizar('ADMIN', 'GERENTE', 'ATENDENTE'), estoqueController.movimentar);

module.exports = router;
