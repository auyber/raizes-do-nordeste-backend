'use strict';

// Junta todas as rotas da API.
const { Router } = require('express');

const authRoutes = require('./authRoutes');
// const unidadeRoutes = require('./unidadeRoutes');
// const produtoRoutes = require('./produtoRoutes');
// const estoqueRoutes = require('./estoqueRoutes');
// const pedidoRoutes = require('./pedidoRoutes');
// const pagamentoRoutes = require('./pagamentoRoutes');
// const fidelidadeRoutes = require('./fidelidadeRoutes');

const router = Router();

router.use('/auth', authRoutes);
// router.use('/unidades', unidadeRoutes);
// router.use('/produtos', produtoRoutes);
// router.use('/estoque', estoqueRoutes);
// router.use('/pedidos', pedidoRoutes);
// router.use('/pagamentos', pagamentoRoutes);
// router.use('/fidelidade', fidelidadeRoutes);

module.exports = router;