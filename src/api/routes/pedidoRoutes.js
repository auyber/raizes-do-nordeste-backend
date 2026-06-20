'use strict';

const { Router } = require('express');
const pedidoController = require('../controllers/pedidoController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

const router = Router();

// Criar pedido.
router.post('/', autenticar, autorizar('CLIENTE'), pedidoController.criar);

// Listar/consultar pedidos.
router.get('/', autenticar, pedidoController.listar);
router.get('/:id', autenticar, pedidoController.buscarPorId);

// Mudar status.
router.patch('/:id/status', autenticar, autorizar('ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA'), pedidoController.atualizarStatus);

// Cancelar pedido
router.post('/:id/cancelar', autenticar, pedidoController.cancelar);

module.exports = router;
