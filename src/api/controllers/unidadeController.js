'use strict';

const unidadeService = require('../../application/unidadeService');
const cardapioService = require('../../application/cardapioService');
const asyncHandler = require('../helpers/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  res.status(200).json(await unidadeService.listar());
});

const buscarPorId = asyncHandler(async (req, res) => {
  res.status(200).json(await unidadeService.buscarPorId(req.params.id));
});

const criar = asyncHandler(async (req, res) => {
  res.status(201).json(await unidadeService.criar(req.body));
});

// Cardapio da unidade.
const cardapio = asyncHandler(async (req, res) => {
  res.status(200).json(await cardapioService.cardapioPorUnidade(req.params.id));
});

module.exports = { listar, buscarPorId, criar, cardapio };
