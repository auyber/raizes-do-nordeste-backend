'use strict';

const db = require('../infrastructure/database/models');
const auditoria = require('../infrastructure/logger/auditoria');
const AppError = require('../shared/AppError');

async function obterCarteira(clienteId) {
  const fidelidade = await db.Fidelidade.findOne({ where: { clienteId } });
  if (!fidelidade) {
    throw new AppError(
      404,
      'FIDELIDADE_NAO_ATIVA',
      'Programa de fidelidade nao ativo para este cliente (sem consentimento).'
    );
  }
  return fidelidade;
}

async function saldo(clienteId) {
  const fidelidade = await obterCarteira(clienteId);
  return { clienteId, saldoPontos: fidelidade.saldoPontos };
}

// Adiciona pontos.
async function adicionarPontos(clienteId, pontos, pedidoId, transaction) {
  const fidelidade = await db.Fidelidade.findOne({ where: { clienteId }, transaction });
  // Se o cliente nao tem fidelidade (nao consentiu), simplesmente nao pontua.
  if (!fidelidade) return null;

  await fidelidade.update({ saldoPontos: fidelidade.saldoPontos + pontos }, { transaction });
  return fidelidade.saldoPontos;
}

async function resgatar(clienteId, pontos) {
  if (!Number.isInteger(pontos) || pontos <= 0) {
    throw new AppError(422, 'ERRO_DE_VALIDACAO', 'Quantidade de pontos invalida.', [
      { field: 'pontos', issue: 'Deve ser um inteiro positivo.' },
    ]);
  }

  const fidelidade = await obterCarteira(clienteId);
  if (fidelidade.saldoPontos < pontos) {
    throw new AppError(409, 'PONTOS_INSUFICIENTES', 'Saldo de pontos insuficiente para o resgate.', [
      { field: 'pontos', issue: `Saldo atual: ${fidelidade.saldoPontos}` },
    ]);
  }

  await fidelidade.update({ saldoPontos: fidelidade.saldoPontos - pontos });

  await auditoria.registrar({
    usuarioId: clienteId,
    acao: 'RESGATAR_PONTOS',
    entidade: 'Fidelidade',
    entidadeId: fidelidade.id,
    detalhe: `Resgate de ${pontos} pontos. Saldo: ${fidelidade.saldoPontos}`,
  });

  return { clienteId, pontosResgatados: pontos, saldoAtual: fidelidade.saldoPontos };
}

module.exports = { saldo, resgatar, adicionarPontos };
