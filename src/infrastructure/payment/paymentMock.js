'use strict';

// Servico de pagamento simulado (mock)
const crypto = require('crypto');

/**
 * Simula a chamada ao gateway de pagamento.
 * @param {object} params
 * @param {number} params.valor       Valor a cobrar.
 * @param {string} params.simular     "APROVADO" ou "RECUSADO".
 * @returns {object} Retorno simulado do gateway.
 */
function solicitarPagamento({ valor, simular = 'APROVADO' }) {
  const aprovado = String(simular).toUpperCase() !== 'RECUSADO';

  return {
    status: aprovado ? 'APROVADO' : 'RECUSADO',
    transacaoExternaId: 'mock_' + crypto.randomUUID(),
    valor: valor,
    payload: {
      gateway: 'MOCK_PAY',
      aprovado: aprovado,
      codigoResposta: aprovado ? '00' : '51',
      mensagem: aprovado ? 'Pagamento aprovado' : 'Pagamento recusado pelo emissor',
      processadoEm: new Date().toISOString(),
    },
  };
}

module.exports = { solicitarPagamento };
