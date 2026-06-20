'use strict';

const { Router } = require('express');
const pagamentoController = require('../controllers/pagamentoController');
const autenticar = require('../middlewares/auth');

const router = Router();

// Solicitar pagamento mock.
router.post('/', autenticar, pagamentoController.processar);

module.exports = router;
