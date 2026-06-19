'use strict';

const db = require('../infrastructure/database/models');
const AppError = require('../shared/AppError');
const { validarOuFalhar } = require('../shared/validacao');

async function listar() {
  return db.Unidade.findAll({ order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
  const unidade = await db.Unidade.findByPk(id);
  if (!unidade) throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade nao encontrada.');
  return unidade;
}

async function criar({ nome, cidade, endereco }) {
  const problemas = [];
  if (!nome) problemas.push({ field: 'nome', issue: 'Campo obrigatorio.' });
  if (!cidade) problemas.push({ field: 'cidade', issue: 'Campo obrigatorio.' });
  validarOuFalhar(problemas);

  return db.Unidade.create({ nome, cidade, endereco });
}

module.exports = { listar, buscarPorId, criar };
