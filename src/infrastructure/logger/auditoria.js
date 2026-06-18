'use strict';
const db = require('../database/models');

async function registrar({ usuarioId = null, acao, entidade = null, entidadeId = null, detalhe = null }) {
  try {
    await db.LogAuditoria.create({ usuarioId, acao, entidade, entidadeId, detalhe });
  } catch (e) {
    console.error('[auditoria] falha ao registrar:', e.message);
  }
}

module.exports = { registrar };