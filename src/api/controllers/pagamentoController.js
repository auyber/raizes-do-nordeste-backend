'use strict';

const pagamentoService = require('../../application/pagamentoService');
const asyncHandler = require('../helpers/asyncHandler');

// Solicita pagamento mock. Body: { pedidoId, simular: "APROVADO" | "RECUSADO" }
const processar = asyncHandler(async (req, res) => {
  const resultado = await pagamentoService.processar(req.body, req.usuario);
  res.status(201).json(resultado);
});

module.exports = { processar };
