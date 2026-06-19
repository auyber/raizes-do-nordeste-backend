'use strict';

const db = require('../infrastructure/database/models');
const auditoria = require('../infrastructure/logger/auditoria');
const AppError = require('../shared/AppError');
const { validarOuFalhar, ehInteiroPositivo } = require('../shared/validacao');

// Consulta o estoque de uma unidade.
async function consultarPorUnidade(unidadeId) {
  const unidade = await db.Unidade.findByPk(unidadeId);
  if (!unidade) throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade nao encontrada.');

  const estoques = await db.Estoque.findAll({
    where: { unidadeId },
    include: [{ model: db.Produto, as: 'produto' }],
    order: [['produtoId', 'ASC']],
  });

  return estoques.map((e) => ({
    estoqueId: e.id,
    produtoId: e.produtoId,
    produto: e.produto ? e.produto.nome : null,
    quantidade: e.quantidade,
  }));
}

// Movimenta o estoque.
async function movimentar({ unidadeId, produtoId, tipo, quantidade }, usuario) {
  const problemas = [];
  if (!ehInteiroPositivo(unidadeId)) problemas.push({ field: 'unidadeId', issue: 'Obrigatorio e inteiro positivo.' });
  if (!ehInteiroPositivo(produtoId)) problemas.push({ field: 'produtoId', issue: 'Obrigatorio e inteiro positivo.' });
  if (!['ENTRADA', 'SAIDA'].includes(tipo)) problemas.push({ field: 'tipo', issue: 'Use ENTRADA ou SAIDA.' });
  if (!ehInteiroPositivo(quantidade)) problemas.push({ field: 'quantidade', issue: 'Deve ser inteiro positivo.' });
  validarOuFalhar(problemas);

  const unidade = await db.Unidade.findByPk(unidadeId);
  if (!unidade) throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade nao encontrada.');
  const produto = await db.Produto.findByPk(produtoId);
  if (!produto) throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto nao encontrado.');

  // Procura o registro de estoque.
  let estoque = await db.Estoque.findOne({ where: { unidadeId, produtoId } });
  if (!estoque) {
    estoque = await db.Estoque.create({ unidadeId, produtoId, quantidade: 0 });
  }

  let novaQuantidade = estoque.quantidade;
  if (tipo === 'ENTRADA') {
    novaQuantidade += quantidade;
  } else {
    if (estoque.quantidade < quantidade) {
      throw new AppError(409, 'ESTOQUE_INSUFICIENTE', 'Saida maior que o estoque disponivel.', [
        { field: 'quantidade', issue: `Disponivel: ${estoque.quantidade}` },
      ]);
    }
    novaQuantidade -= quantidade;
  }

  await estoque.update({ quantidade: novaQuantidade });

  await auditoria.registrar({
    usuarioId: usuario ? usuario.id : null,
    acao: 'MOVIMENTAR_ESTOQUE',
    entidade: 'Estoque',
    entidadeId: estoque.id,
    detalhe: `${tipo} de ${quantidade}. Saldo: ${novaQuantidade}`,
  });

  return { estoqueId: estoque.id, unidadeId, produtoId, tipo, quantidade, saldoAtual: novaQuantidade };
}

module.exports = { consultarPorUnidade, movimentar };
