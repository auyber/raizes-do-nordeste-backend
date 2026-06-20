'use strict';

// Fluxo: pedido AGUARDANDO_PAGAMENTO -> chama gateway mock -> PAGO ou PAGAMENTO_RECUSADO.
const db = require('../infrastructure/database/models');
const paymentMock = require('../infrastructure/payment/paymentMock');
const auditoria = require('../infrastructure/logger/auditoria');
const fidelidadeService = require('./fidelidadeService');
const AppError = require('../shared/AppError');
const { calcularPontos } = require('../domain/pedidoRegras');

async function processar({ pedidoId, simular }, usuario) {
  const pedido = await db.Pedido.findByPk(pedidoId, {
    include: [{ model: db.Pagamento, as: 'pagamento' }],
  });
  if (!pedido) throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido nao encontrado.');

  // Cliente so paga o proprio pedido.
  if (usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Voce nao pode pagar este pedido.');
  }

  // So da para pagar se estiver aguardando pagamento ou apos uma recusa anterior.
  if (!['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_RECUSADO'].includes(pedido.status)) {
    throw new AppError(409, 'PEDIDO_NAO_PAGAVEL', `Pedido no status ${pedido.status} nao pode ser pago.`);
  }

  // Chama o gateway de pagamento simulado
  const retorno = paymentMock.solicitarPagamento({ valor: Number(pedido.total), simular });

  // Registra o pagamento com o payload de retorno como evidencia.
  const pagamento = await db.Pagamento.create({
    pedidoId: pedido.id,
    status: retorno.status,
    valor: retorno.valor,
    transacaoExternaId: retorno.transacaoExternaId,
    payloadRetorno: JSON.stringify(retorno.payload),
  });

  let pontosGanhos = 0;

  if (retorno.status === 'APROVADO') {
    await pedido.update({ status: 'PAGO' });

    // Programa de fidelidade.
    pontosGanhos = calcularPontos(pedido.total);
    if (pontosGanhos > 0) {
      await fidelidadeService.adicionarPontos(pedido.clienteId, pontosGanhos, pedido.id);
    }
  } else {
    await pedido.update({ status: 'PAGAMENTO_RECUSADO' });
    pontosGanhos = 0;
  }

  await auditoria.registrar({
    usuarioId: usuario.id,
    acao: 'PROCESSAR_PAGAMENTO',
    entidade: 'Pagamento',
    entidadeId: pagamento.id,
    detalhe: `Pedido ${pedido.id} -> ${retorno.status}`,
  });

  return {
    pedidoId: pedido.id,
    statusPedido: pedido.status,
    pagamento: {
      id: pagamento.id,
      status: pagamento.status,
      valor: pagamento.valor,
      transacaoExternaId: pagamento.transacaoExternaId,
      retornoGateway: retorno.payload,
    },
    pontosGanhos,
  };
}

module.exports = { processar };
