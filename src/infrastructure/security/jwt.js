'use strict';

const jwt = require('jsonwebtoken');

// Chave usada para assinar o token.
const SEGREDO = process.env.JWT_SECRET || 'segredo_padrao_inseguro';

// Tempo que o token vai durar.
const EXPIRA_EM = process.env.JWT_EXPIRES_IN || '1h';

function gerarToken(payload) {
  // Cria o token com os dados recebidos.
  return jwt.sign(payload, SEGREDO, { expiresIn: EXPIRA_EM });
}

function verificarToken(token) {
  // Verifica se o token é válido.
  return jwt.verify(token, SEGREDO);
}

module.exports = { gerarToken, verificarToken };