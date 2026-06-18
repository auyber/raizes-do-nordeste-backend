'use strict';

// Controlar quem pode acessar certas rotas.
const AppError = require('../../shared/AppError');

module.exports = function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError(401, 'NAO_AUTENTICADO', 'Usuario nao autenticado.'));
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return next(
        new AppError(403, 'SEM_PERMISSAO', 'Voce nao tem permissao para acessar este recurso.')
      );
    }

    next();
  };
};
