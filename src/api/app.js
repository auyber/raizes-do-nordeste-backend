'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const requestId = require('./middlewares/requestId');
const { tratarErros, naoEncontrado } = require('./middlewares/errorHandler');
const rotas = require('./routes');
const openapi = require('./docs/openapi');

const app = express();

// Middlewares basicos
app.use(cors());
app.use(express.json());
app.use(requestId);

// Rota simples para checar se a API esta no ar.
app.get('/', (req, res) => {
  res.json({
    nome: 'API Raizes do Nordeste',
    status: 'online',
    documentacao: '/api/docs',
  });
});

// Documentacao Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
// JSON cru do OpenAPI (util para importar no Postman/Insomnia)
app.get('/api/docs.json', (req, res) => res.json(openapi));

// Rotas da API
app.use('/api', rotas);

// 404 para rotas inexistentes
app.use(naoEncontrado);

// Tratamento central de erros
app.use(tratarErros);

module.exports = app;
