'use strict';

const { Router } = require('express');
const fidelidadeController = require('../controllers/fidelidadeController');
const autenticar = require('../middlewares/auth');
const autorizar = require('../middlewares/autorizar');

const router = Router();

// Saldo e resgate.
router.get('/saldo', autenticar, autorizar('CLIENTE'), fidelidadeController.saldo);
router.post('/resgatar', autenticar, autorizar('CLIENTE'), fidelidadeController.resgatar);

module.exports = router;
