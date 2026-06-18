'use strict';

// Funcoes para proteger a senha.
const bcrypt = require('bcryptjs');

function gerarHash(senhaPura) {
  // O numero 10 define o nivel de dificuldade para gerar o hash da senha.
  return bcrypt.hashSync(senhaPura, 10);
}

function compararSenha(senhaPura, hashSalvo) {
  return bcrypt.compareSync(senhaPura, hashSalvo);
}

module.exports = { gerarHash, compararSenha };