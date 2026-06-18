'use strict';

// Middleware para proteger rotas que precisam de login. Verifica se veio um token JWT no Authorization.
const { verificarToken } = require('../../infrastructure/security/jwt');
const AppError = require('../../shared/AppError');

module.exports = function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'NAO_AUTENTICADO', 'Token de acesso ausente ou mal formatado.'));
  }

  const token = header.split(' ')[1];

  try {
    const dados = verificarToken(token);
    // Salva os dados do usuario na requisicao para usar depois.
    req.usuario = { id: dados.id, perfil: dados.perfil, nome: dados.nome };
    next();
  } catch (e) {
    return next(new AppError(401, 'TOKEN_INVALIDO', 'Token invalido ou expirado.'));
  }
};
