'use strict';

const produtoService = require('../../application/produtoService');
const asyncHandler = require('../helpers/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  res.status(200).json(await produtoService.listar(req.query));
});

const buscarPorId = asyncHandler(async (req, res) => {
  res.status(200).json(await produtoService.buscarPorId(req.params.id));
});

const criar = asyncHandler(async (req, res) => {
  res.status(201).json(await produtoService.criar(req.body));
});

const atualizar = asyncHandler(async (req, res) => {
  res.status(200).json(await produtoService.atualizar(req.params.id, req.body));
});

const remover = asyncHandler(async (req, res) => {
  await produtoService.remover(req.params.id);
  res.status(204).send(); // 204 = sucesso, sem conteudo
});

module.exports = { listar, buscarPorId, criar, atualizar, remover };
