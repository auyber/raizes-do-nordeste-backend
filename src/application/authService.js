'use strict';

const db = require('../infrastructure/database/models');
const { gerarHash, compararSenha } = require('../infrastructure/security/hash');
const { gerarToken } = require('../infrastructure/security/jwt');
const auditoria = require('../infrastructure/logger/auditoria');
const AppError = require('../shared/AppError');
const { validarOuFalhar, ehEmailValido } = require('../shared/validacao');

const PERFIS_VALIDOS = ['ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'];

// Monta o objeto "publico" do usuario.
function usuarioPublico(u) {
  return { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil };
}

async function cadastrar({ nome, email, senha, perfil, consentimentoFidelidade }) {
  const problemas = [];
  if (!nome) problemas.push({ field: 'nome', issue: 'Campo obrigatorio.' });
  if (!ehEmailValido(email)) problemas.push({ field: 'email', issue: 'E-mail invalido.' });
  if (!senha || senha.length < 6)
    problemas.push({ field: 'senha', issue: 'A senha deve ter no minimo 6 caracteres.' });
  if (perfil && !PERFIS_VALIDOS.includes(perfil))
    problemas.push({ field: 'perfil', issue: 'Perfil invalido.' });
  validarOuFalhar(problemas);

  const jaExiste = await db.Usuario.findOne({ where: { email } });
  if (jaExiste) {
    throw new AppError(409, 'EMAIL_JA_CADASTRADO', 'Ja existe um usuario com este e-mail.');
  }

  const perfilFinal = perfil || 'CLIENTE';
  const consentiu = Boolean(consentimentoFidelidade);

  const usuario = await db.Usuario.create({
    nome,
    email,
    senhaHash: gerarHash(senha),
    perfil: perfilFinal,
    consentimentoFidelidade: consentiu,
    consentimentoData: consentiu ? new Date() : null,
  });

  // Se for cliente e consentiu, cria a carteira de fidelidade.
  if (perfilFinal === 'CLIENTE' && consentiu) {
    await db.Fidelidade.create({ clienteId: usuario.id, saldoPontos: 0 });
  }

  await auditoria.registrar({
    usuarioId: usuario.id,
    acao: 'CADASTRAR_USUARIO',
    entidade: 'Usuario',
    entidadeId: usuario.id,
    detalhe: `Perfil: ${perfilFinal}`,
  });

  return usuarioPublico(usuario);
}

async function login({ email, senha }) {
  const problemas = [];
  if (!email) problemas.push({ field: 'email', issue: 'Campo obrigatorio.' });
  if (!senha) problemas.push({ field: 'senha', issue: 'Campo obrigatorio.' });
  validarOuFalhar(problemas);

  const usuario = await db.Usuario.findOne({ where: { email } });

  // Mensagem generica de proposito: para nao revelar se foi o e-mail ou a senha.
  if (!usuario || !compararSenha(senha, usuario.senhaHash)) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha invalidos.');
  }

  const accessToken = gerarToken({ id: usuario.id, perfil: usuario.perfil, nome: usuario.nome });

  await auditoria.registrar({
    usuarioId: usuario.id,
    acao: 'LOGIN',
    entidade: 'Usuario',
    entidadeId: usuario.id,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    user: usuarioPublico(usuario),
  };
}

async function perfilDoUsuario(id) {
  const usuario = await db.Usuario.findByPk(id);
  if (!usuario) throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuario nao encontrado.');
  return usuarioPublico(usuario);
}

module.exports = { cadastrar, login, perfilDoUsuario };
