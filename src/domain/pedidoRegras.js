'use strict';

// Canais validos.
const CANAIS_VALIDOS = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];

// Transicoes de status permitidas.
const TRANSICOES_PERMITIDAS = {
  AGUARDANDO_PAGAMENTO: ['PAGO', 'PAGAMENTO_RECUSADO', 'CANCELADO'],
  PAGAMENTO_RECUSADO: ['AGUARDANDO_PAGAMENTO', 'CANCELADO'],
  PAGO: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['PRONTO', 'CANCELADO'],
  PRONTO: ['ENTREGUE'],
  ENTREGUE: [],
  CANCELADO: [],
};

// Verifica se da para mudar de um status para outro.
function podeMudarStatus(statusAtual, novoStatus) {
  const permitidos = TRANSICOES_PERMITIDAS[statusAtual] || [];
  return permitidos.includes(novoStatus);
}

// Regra de fidelidade: 1 ponto para R$ 1,00 gasto (arredondado para baixo).
function calcularPontos(valorTotal) {
  return Math.floor(Number(valorTotal));
}

module.exports = {
  CANAIS_VALIDOS,
  TRANSICOES_PERMITIDAS,
  podeMudarStatus,
  calcularPontos,
};
