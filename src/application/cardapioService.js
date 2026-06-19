'use strict';

// consultar o cardapio de uma unidade.
const db = require('../infrastructure/database/models');
const AppError = require('../shared/AppError');

async function cardapioPorUnidade(unidadeId) {
  const unidade = await db.Unidade.findByPk(unidadeId);
  if (!unidade) throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade nao encontrada.');

  const estoques = await db.Estoque.findAll({
    where: { unidadeId },
    include: [{ model: db.Produto, as: 'produto' }],
    order: [['produtoId', 'ASC']],
  });

  const itens = estoques
    .filter((e) => e.produto && e.produto.ativo)
    .map((e) => ({
      produtoId: e.produtoId,
      nome: e.produto.nome,
      descricao: e.produto.descricao,
      categoria: e.produto.categoria,
      preco: e.produto.preco,
      disponivel: e.quantidade > 0,
      quantidadeDisponivel: e.quantidade,
    }));

  return { unidadeId: unidade.id, unidade: unidade.nome, itens };
}

module.exports = { cardapioPorUnidade };
