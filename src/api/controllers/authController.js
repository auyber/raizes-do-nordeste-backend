'use strict';

const authService = require('../../application/authService');
const asyncHandler = require('../helpers/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const usuario = await authService.cadastrar(req.body);
  res.status(201).json(usuario);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.status(200).json(resultado);
});

const me = asyncHandler(async (req, res) => {
  const usuario = await authService.perfilDoUsuario(req.usuario.id);
  res.status(200).json(usuario);
});

module.exports = { register, login, me };
