'use strict';

const fidelidadeService = require('../../application/fidelidadeService');
const asyncHandler = require('../helpers/asyncHandler');

// Saldo do cliente logado.
const saldo = asyncHandler(async (req, res) => {
  res.status(200).json(await fidelidadeService.saldo(req.usuario.id));
});

// Resgate de pontos.
const resgatar = asyncHandler(async (req, res) => {
  const resultado = await fidelidadeService.resgatar(req.usuario.id, Number(req.body.pontos));
  res.status(200).json(resultado);
});

module.exports = { saldo, resgatar };
