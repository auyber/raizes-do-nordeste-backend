'use strict';

const pedidoService = require('../../application/pedidoService');
const asyncHandler = require('../helpers/asyncHandler');

const criar = asyncHandler(async (req, res) => {
  const pedido = await pedidoService.criar(req.body, req.usuario);
  res.status(201).json(pedido);
});

const listar = asyncHandler(async (req, res) => {
  res.status(200).json(await pedidoService.listar(req.query, req.usuario));
});

const buscarPorId = asyncHandler(async (req, res) => {
  const pedido = await pedidoService.buscarPorId(req.params.id, req.usuario);
  res.status(200).json(pedidoService.formatarPedido(pedido));
});

const atualizarStatus = asyncHandler(async (req, res) => {
  const pedido = await pedidoService.atualizarStatus(req.params.id, req.body.status, req.usuario);
  res.status(200).json(pedido);
});

const cancelar = asyncHandler(async (req, res) => {
  const pedido = await pedidoService.atualizarStatus(req.params.id, 'CANCELADO', req.usuario);
  res.status(200).json(pedido);
});

module.exports = { criar, listar, buscarPorId, atualizarStatus, cancelar };
