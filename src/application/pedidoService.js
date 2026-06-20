'use strict';

const db = require('../infrastructure/database/models');
const auditoria = require('../infrastructure/logger/auditoria');
const AppError = require('../shared/AppError');
const { validarOuFalhar, ehInteiroPositivo } = require('../shared/validacao');
const { CANAIS_VALIDOS, podeMudarStatus } = require('../domain/pedidoRegras');

// Formata o pedido para a resposta da API.
function formatarPedido(pedido) {
  return {
    pedidoId: pedido.id,
    clienteId: pedido.clienteId,
    unidadeId: pedido.unidadeId,
    canalPedido: pedido.canalPedido,
    status: pedido.status,
    total: pedido.total,
    formaPagamento: pedido.formaPagamento,
    itens: (pedido.itens || []).map((i) => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      subtotal: i.subtotal,
    })),
    pagamento: pedido.pagamento
      ? { status: pedido.pagamento.status, valor: pedido.pagamento.valor }
      : null,
    createdAt: pedido.createdAt,
  };
}

async function buscarPorId(id, usuario) {
  const pedido = await db.Pedido.findByPk(id, {
    include: [
      { model: db.ItemPedido, as: 'itens' },
      { model: db.Pagamento, as: 'pagamento' },
    ],
  });
  if (!pedido) throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido nao encontrado.');

  // Cliente so pode ver os proprios pedidos.
  if (usuario && usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Voce nao pode acessar este pedido.');
  }

  return pedido;
}

async function criar({ unidadeId, canalPedido, itens, formaPagamento }, usuario) {
  // Validacao basica de entrada
  const problemas = [];
  if (!ehInteiroPositivo(unidadeId)) problemas.push({ field: 'unidadeId', issue: 'Obrigatorio e inteiro positivo.' });
  if (!canalPedido) problemas.push({ field: 'canalPedido', issue: 'Campo obrigatorio.' });
  else if (!CANAIS_VALIDOS.includes(canalPedido))
    problemas.push({ field: 'canalPedido', issue: `Use um destes: ${CANAIS_VALIDOS.join(', ')}.` });
  if (!Array.isArray(itens) || itens.length === 0)
    problemas.push({ field: 'itens', issue: 'Informe pelo menos um item.' });
  validarOuFalhar(problemas);

  // Valida cada item individualmente.
  const problemasItens = [];
  itens.forEach((item, idx) => {
    if (!ehInteiroPositivo(item.produtoId))
      problemasItens.push({ field: `itens[${idx}].produtoId`, issue: 'Inteiro positivo obrigatorio.' });
    if (!ehInteiroPositivo(item.quantidade))
      problemasItens.push({ field: `itens[${idx}].quantidade`, issue: 'Inteiro positivo obrigatorio.' });
  });
  validarOuFalhar(problemasItens);

  // Unidade existe?
  const unidade = await db.Unidade.findByPk(unidadeId);
  if (!unidade) throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade nao encontrada.');

  // Os produtos existem e ha estoque?
  const itensCalculados = [];
  let total = 0;

  for (let idx = 0; idx < itens.length; idx++) {
    const item = itens[idx];

    const produto = await db.Produto.findByPk(item.produtoId);
    if (!produto || !produto.ativo) {
      throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', `Produto ${item.produtoId} nao encontrado.`);
    }

    const estoque = await db.Estoque.findOne({
      where: { unidadeId, produtoId: item.produtoId },
    });
    const disponivel = estoque ? estoque.quantidade : 0;
    if (disponivel < item.quantidade) {
      throw new AppError(409, 'ESTOQUE_INSUFICIENTE', 'Nao ha quantidade suficiente para um ou mais itens.', [
        { field: `itens[${idx}].quantidade`, issue: `Disponivel: ${disponivel}` },
      ]);
    }

    const precoUnitario = Number(produto.preco);
    const subtotal = precoUnitario * item.quantidade;
    total += subtotal;

    itensCalculados.push({
      produtoId: produto.id,
      quantidade: item.quantidade,
      precoUnitario,
      subtotal,
      estoque,
    });
  }

  // Grava tudo dentro de uma transacao
  const pedido = await db.sequelize.transaction(async (t) => {
    const novoPedido = await db.Pedido.create(
      {
        clienteId: usuario.id,
        unidadeId,
        canalPedido,
        status: 'AGUARDANDO_PAGAMENTO',
        total,
        formaPagamento: formaPagamento || 'MOCK',
      },
      { transaction: t }
    );

    for (const ic of itensCalculados) {
      await db.ItemPedido.create(
        {
          pedidoId: novoPedido.id,
          produtoId: ic.produtoId,
          quantidade: ic.quantidade,
          precoUnitario: ic.precoUnitario,
          subtotal: ic.subtotal,
        },
        { transaction: t }
      );
      // Baixa no estoque.
      await ic.estoque.update({ quantidade: ic.estoque.quantidade - ic.quantidade }, { transaction: t });
    }

    return novoPedido;
  });

  await auditoria.registrar({
    usuarioId: usuario.id,
    acao: 'CRIAR_PEDIDO',
    entidade: 'Pedido',
    entidadeId: pedido.id,
    detalhe: `Canal: ${canalPedido}. Total: ${total}`,
  });

  const completo = await buscarPorId(pedido.id, usuario);
  return formatarPedido(completo);
}

async function listar({ canalPedido, status, page = 1, limit = 10 }, usuario) {
  const pagina = Math.max(1, parseInt(page, 10) || 1);
  const porPagina = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pagina - 1) * porPagina;

  const where = {};
  if (canalPedido) where.canalPedido = canalPedido;
  if (status) where.status = status;
  // Cliente so ve os proprios pedidos.
  if (usuario.perfil === 'CLIENTE') where.clienteId = usuario.id;

  const { count, rows } = await db.Pedido.findAndCountAll({
    where,
    include: [
      { model: db.ItemPedido, as: 'itens' },
      { model: db.Pagamento, as: 'pagamento' },
    ],
    order: [['id', 'DESC']],
    limit: porPagina,
    offset,
    distinct: true,
  });

  return {
    data: rows.map(formatarPedido),
    page: pagina,
    limit: porPagina,
    total: count,
    totalPages: Math.ceil(count / porPagina),
  };
}

async function atualizarStatus(id, novoStatus, usuario) {
  const pedido = await db.Pedido.findByPk(id, { include: [{ model: db.ItemPedido, as: 'itens' }] });
  if (!pedido) throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido nao encontrado.');

  if (!novoStatus) {
    throw new AppError(422, 'ERRO_DE_VALIDACAO', 'Informe o novo status.', [
      { field: 'status', issue: 'Campo obrigatorio.' },
    ]);
  }

  if (!podeMudarStatus(pedido.status, novoStatus)) {
    throw new AppError(409, 'TRANSICAO_INVALIDA', `Nao e possivel mudar de ${pedido.status} para ${novoStatus}.`);
  }

  // Se cancelar, devolve os itens ao estoque.
  if (novoStatus === 'CANCELADO') {
    await db.sequelize.transaction(async (t) => {
      for (const item of pedido.itens) {
        const estoque = await db.Estoque.findOne({
          where: { unidadeId: pedido.unidadeId, produtoId: item.produtoId },
          transaction: t,
        });
        if (estoque) {
          await estoque.update({ quantidade: estoque.quantidade + item.quantidade }, { transaction: t });
        }
      }
      await pedido.update({ status: novoStatus }, { transaction: t });
    });
  } else {
    await pedido.update({ status: novoStatus });
  }

  await auditoria.registrar({
    usuarioId: usuario.id,
    acao: 'MUDAR_STATUS_PEDIDO',
    entidade: 'Pedido',
    entidadeId: pedido.id,
    detalhe: `Novo status: ${novoStatus}`,
  });

  const completo = await buscarPorId(pedido.id, usuario);
  return formatarPedido(completo);
}

module.exports = { criar, listar, buscarPorId, atualizarStatus, formatarPedido };
