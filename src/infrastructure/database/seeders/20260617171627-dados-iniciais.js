'use strict';

// Seed: popula o banco com dados para testar a API rapidamente.
// Senha de todos os usuarios de exemplo: "Senha@123"
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    const senhaHash = bcrypt.hashSync('Senha@123', 10);

    // ----- Usuarios (um de cada perfil) -----
    await queryInterface.bulkInsert('usuarios', [
      {
        id: 1, nome: 'Ana Admin', email: 'admin@raizes.com', senha_hash: senhaHash,
        perfil: 'ADMIN', consentimento_fidelidade: false, consentimento_data: null,
        created_at: agora, updated_at: agora,
      },
      {
        id: 2, nome: 'Gabriel Gerente', email: 'gerente@raizes.com', senha_hash: senhaHash,
        perfil: 'GERENTE', consentimento_fidelidade: false, consentimento_data: null,
        created_at: agora, updated_at: agora,
      },
      {
        id: 3, nome: 'Carla Cliente', email: 'cliente@raizes.com', senha_hash: senhaHash,
        perfil: 'CLIENTE', consentimento_fidelidade: true, consentimento_data: agora,
        created_at: agora, updated_at: agora,
      },
    ]);

    // Saldo de fidelidade do cliente que consentiu.
    await queryInterface.bulkInsert('fidelidades', [
      { id: 1, cliente_id: 3, saldo_pontos: 0, created_at: agora, updated_at: agora },
    ]);

    // ----- Unidades -----
    await queryInterface.bulkInsert('unidades', [
      { id: 1, nome: 'Raizes - Recife Centro', cidade: 'Recife', endereco: 'Rua do Bom Jesus, 100', ativo: true, created_at: agora, updated_at: agora },
      { id: 2, nome: 'Raizes - Salvador Pelourinho', cidade: 'Salvador', endereco: 'Largo do Pelourinho, 25', ativo: true, created_at: agora, updated_at: agora },
    ]);

    // ----- Produtos (cardapio nordestino) -----
    await queryInterface.bulkInsert('produtos', [
      { id: 1, nome: 'Acaraje', descricao: 'Bolinho de feijao frito com vatapa e camarao', categoria: 'Salgados', preco: 18.50, ativo: true, created_at: agora, updated_at: agora },
      { id: 2, nome: 'Tapioca de Queijo Coalho', descricao: 'Tapioca recheada com queijo coalho', categoria: 'Salgados', preco: 14.00, ativo: true, created_at: agora, updated_at: agora },
      { id: 3, nome: 'Cuscuz Nordestino', descricao: 'Cuscuz com ovo e manteiga de garrafa', categoria: 'Pratos', preco: 16.90, ativo: true, created_at: agora, updated_at: agora },
      { id: 4, nome: 'Caldo de Cana 500ml', descricao: 'Caldo de cana gelado', categoria: 'Bebidas', preco: 9.00, ativo: true, created_at: agora, updated_at: agora },
    ]);

    // ----- Estoque por unidade -----
    await queryInterface.bulkInsert('estoques', [
      // Unidade 1 (Recife)
      { id: 1, unidade_id: 1, produto_id: 1, quantidade: 50, created_at: agora, updated_at: agora },
      { id: 2, unidade_id: 1, produto_id: 2, quantidade: 40, created_at: agora, updated_at: agora },
      { id: 3, unidade_id: 1, produto_id: 3, quantidade: 30, created_at: agora, updated_at: agora },
      { id: 4, unidade_id: 1, produto_id: 4, quantidade: 100, created_at: agora, updated_at: agora },
      // Unidade 2 (Salvador) - de proposito o produto 3 fica com estoque baixo (para testar 409)
      { id: 5, unidade_id: 2, produto_id: 1, quantidade: 20, created_at: agora, updated_at: agora },
      { id: 6, unidade_id: 2, produto_id: 3, quantidade: 1, created_at: agora, updated_at: agora },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('estoques', null, {});
    await queryInterface.bulkDelete('produtos', null, {});
    await queryInterface.bulkDelete('unidades', null, {});
    await queryInterface.bulkDelete('fidelidades', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};
