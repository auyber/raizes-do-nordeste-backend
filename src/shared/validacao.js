'use strict';

const AppError = require('./AppError');

// Junta varios problemas e lanca um unico erro 422
function validarOuFalhar(problemas) {
  if (problemas.length > 0) {
    throw new AppError(422, 'ERRO_DE_VALIDACAO', 'Um ou mais campos estao invalidos.', problemas);
  }
}

function ehEmailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ehInteiroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}

module.exports = { validarOuFalhar, ehEmailValido, ehInteiroPositivo };
