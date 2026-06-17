'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      senha_hash: { type: Sequelize.STRING, allowNull: false },
      perfil: {
        type: Sequelize.ENUM('ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'),
        allowNull: false,
        defaultValue: 'CLIENTE',
      },
      consentimento_fidelidade: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      consentimento_data: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
