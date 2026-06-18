'use strict';

const AppError = require('../../shared/AppError');

// Funcao auxiliar que monta o corpo padrao de erro.
function montarErro({ errorCode, message, details, req }) {
  return {
    error: errorCode,
    message: message,
    details: details || [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.requestId,
  };
}

// 404 - rota nao encontrada.
function naoEncontrado(req, res) {
  res.status(404).json(
    montarErro({
      errorCode: 'ROTA_NAO_ENCONTRADA',
      message: 'O recurso solicitado nao existe.',
      details: [],
      req,
    })
  );
}

// Tratador final de erros.
function tratarErros(err, req, res, next) {
  // Erro previsivel que nos mesmos lancamos.
  if (err instanceof AppError || err.isAppError) {
    return res.status(err.statusCode).json(
      montarErro({
        errorCode: err.errorCode,
        message: err.message,
        details: err.details,
        req,
      })
    );
  }

  // Erros de validacao/unicidade do Sequelize viram 422.
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = (err.errors || []).map((e) => ({ field: e.path, issue: e.message }));
    return res.status(422).json(
      montarErro({
        errorCode: 'ERRO_DE_VALIDACAO',
        message: 'Dados invalidos.',
        details,
        req,
      })
    );
  }

  // Qualquer outro erro inesperado vira 500.
  console.error('[erro inesperado]', err);
  return res.status(500).json(
    montarErro({
      errorCode: 'ERRO_INTERNO',
      message: 'Ocorreu um erro inesperado no servidor.',
      details: [],
      req,
    })
  );
}

module.exports = { tratarErros, naoEncontrado };
