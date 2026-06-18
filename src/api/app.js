'use strict';
require('dotenv').config();

const express = require('express');
const requestId = require('./middlewares/requestId');
const { tratarErros } = require('./middlewares/errorHandler');
const rotas = require('./routes');

const app = express();

app.use(express.json());
app.use(requestId);

app.get('/', (req, res) => {
  res.json({ nome: 'API Raizes do Nordeste', status: 'online' });
});

app.use('/api', rotas);

app.use(tratarErros); // sempre o último

module.exports = app;