'use strict';

const db = require('../infrastructure/database/models');
const AppError = require('../shared/AppError');
const { validarOuFalhar } = require('../shared/validacao');

// Lista produtos com paginacao simples.
async function listar({ page = 1, limit = 10 }) {
  const pagina = Math.max(1, parseInt(page, 10) || 1);
  const porPagina = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pagina - 1) * porPagina;

  const { count, rows } = await db.Produto.findAndCountAll({
    order: [['id', 'ASC']],
    limit: porPagina,
    offset,
  });

  return {
    data: rows,
    page: pagina,
    limit: porPagina,
    total: count,
    totalPages: Math.ceil(count / porPagina),
  };
}

async function buscarPorId(id) {
  const produto = await db.Produto.findByPk(id);
  if (!produto) throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto nao encontrado.');
  return produto;
}

async function criar({ nome, descricao, categoria, preco }) {
  const problemas = [];
  if (!nome) problemas.push({ field: 'nome', issue: 'Campo obrigatorio.' });
  if (preco === undefined || preco === null)
    problemas.push({ field: 'preco', issue: 'Campo obrigatorio.' });
  else if (isNaN(Number(preco)) || Number(preco) < 0)
    problemas.push({ field: 'preco', issue: 'O preco deve ser um numero maior ou igual a zero.' });
  validarOuFalhar(problemas);

  return db.Produto.create({ nome, descricao, categoria, preco });
}

async function atualizar(id, { nome, descricao, categoria, preco, ativo }) {
  const produto = await buscarPorId(id);
  if (preco !== undefined && (isNaN(Number(preco)) || Number(preco) < 0)) {
    throw new AppError(422, 'ERRO_DE_VALIDACAO', 'Preco invalido.', [
      { field: 'preco', issue: 'O preco deve ser um numero maior ou igual a zero.' },
    ]);
  }
  await produto.update({
    nome: nome ?? produto.nome,
    descricao: descricao ?? produto.descricao,
    categoria: categoria ?? produto.categoria,
    preco: preco ?? produto.preco,
    ativo: ativo ?? produto.ativo,
  });
  return produto;
}

async function remover(id) {
  const produto = await buscarPorId(id);
  //apenas desativa, para nao quebrar pedidos antigos que usam o produto.
  await produto.update({ ativo: false });
  return { id: produto.id, ativo: false };
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
