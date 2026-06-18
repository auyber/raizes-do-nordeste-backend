'use strict';

const app = require('./app');
const db = require('../infrastructure/database/models');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await db.sequelize.authenticate();      // testa a conexao com o banco
    console.log('[banco] conexao OK');
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Falha ao iniciar:', e.message);
    process.exit(1);
  }
}

iniciar();