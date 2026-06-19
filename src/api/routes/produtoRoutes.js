'use strict';

const { Router } = require('express');
const produtoController = require('../controllers/produtoController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

const router = Router();

// Consulta: qualquer usuario logado.
router.get('/', autenticar, produtoController.listar);
router.get('/:id', autenticar, produtoController.buscarPorId);

// Gerenciamento: somente admin ou gerente.
router.post('/', autenticar, autorizar('ADMIN', 'GERENTE'), produtoController.criar);
router.put('/:id', autenticar, autorizar('ADMIN', 'GERENTE'), produtoController.atualizar);
router.delete('/:id', autenticar, autorizar('ADMIN', 'GERENTE'), produtoController.remover);

module.exports = router;
