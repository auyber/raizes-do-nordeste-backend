'use strict';

// Gera um id unico por requisicao.
const crypto = require('crypto');

module.exports = function requestId(req, res, next) {
  req.requestId = crypto.randomUUID();
  next();
};
