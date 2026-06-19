'use strict';

const estoqueService = require('../../application/estoqueService');
const asyncHandler = require('../helpers/asyncHandler');
const AppError = require('../../shared/AppError');

const consultar = asyncHandler(async (req, res) => {
  const unidadeId = parseInt(req.query.unidadeId, 10);
  if (!unidadeId) {
    throw new AppError(422, 'ERRO_DE_VALIDACAO', 'Informe o unidadeId.', [
      { field: 'unidadeId', issue: 'Query param obrigatorio (?unidadeId=1).' },
    ]);
  }
  res.status(200).json(await estoqueService.consultarPorUnidade(unidadeId));
});

const movimentar = asyncHandler(async (req, res) => {
  const resultado = await estoqueService.movimentar(req.body, req.usuario);
  res.status(201).json(resultado);
});

module.exports = { consultar, movimentar };
