'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs_auditoria', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      acao: { type: Sequelize.STRING, allowNull: false },
      entidade: { type: Sequelize.STRING, allowNull: true },
      entidade_id: { type: Sequelize.INTEGER, allowNull: true },
      detalhe: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('logs_auditoria');
  },
};
