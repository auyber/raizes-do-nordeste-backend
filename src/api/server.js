// Ponto de entrada da API. Por enquanto só sobe o servidor e responde no "/".
require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

// Rota de teste, só pra confirmar que a API está no ar.
app.get('/', (req, res) => {
  res.json({ nome: 'API Raizes do Nordeste', status: 'online' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});