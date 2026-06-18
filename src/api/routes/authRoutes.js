'use strict';

const { Router } = require('express');
const authController = require('../controllers/authController');
const autenticar = require('../middlewares/auth');

const router = Router();

// Publicos
router.post('/register', authController.register);
router.post('/login', authController.login);

// Precisa estar logado para ver o proprio perfil
router.get('/me', autenticar, authController.me);

module.exports = router;
