'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unidades', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: false },
      cidade: { type: Sequelize.STRING, allowNull: false },
      endereco: { type: Sequelize.STRING, allowNull: true },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('unidades');
  },
};
