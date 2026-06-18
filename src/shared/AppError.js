'use strict';

class AppError extends Error {
  /**
   * @param {number} statusCode  Codigo HTTP.
   * @param {string} errorCode   Codigo interno em MAIUSCULAS.
   * @param {string} message     Mensagem legivel para o usuario.
   * @param {Array}  details     Lista opcional de { field, issue }.
   */
  constructor(statusCode, errorCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isAppError = true;
  }
}

module.exports = AppError;