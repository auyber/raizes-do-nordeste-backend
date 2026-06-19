'use strict';

// Junta todas as rotas da API.
const { Router } = require('express');

const authRoutes = require('./authRoutes');
const unidadeRoutes = require('./unidadeRoutes');
const produtoRoutes = require('./produtoRoutes');
const estoqueRoutes = require('./estoqueRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/unidades', unidadeRoutes);
router.use('/produtos', produtoRoutes);
router.use('/estoque', estoqueRoutes);


module.exports = router;