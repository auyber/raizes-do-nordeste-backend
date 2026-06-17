'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produtos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: false },
      descricao: { type: Sequelize.STRING, allowNull: true },
      categoria: { type: Sequelize.STRING, allowNull: true },
      preco: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('produtos');
  },
};
