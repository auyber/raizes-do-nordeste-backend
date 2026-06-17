'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      pedido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pedidos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'APROVADO', 'RECUSADO'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      valor: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      transacao_externa_id: { type: Sequelize.STRING, allowNull: true },
      payload_retorno: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagamentos');
  },
};
