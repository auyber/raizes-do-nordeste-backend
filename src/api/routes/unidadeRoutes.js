'use strict';

const { Router } = require('express');
const unidadeController = require('../controllers/unidadeController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

const router = Router();

// Listar/consultar unidades.
router.get('/', autenticar, unidadeController.listar);
router.get('/:id', autenticar, unidadeController.buscarPorId);

// Cardapio da unidade.
router.get('/:id/cardapio', autenticar, unidadeController.cardapio);

// Criar unidade: somente admin ou gerente.
router.post('/', autenticar, autorizar('ADMIN', 'GERENTE'), unidadeController.criar);

module.exports = router;
