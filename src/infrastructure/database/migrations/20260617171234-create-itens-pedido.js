'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('itens_pedido', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      pedido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pedidos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantidade: { type: Sequelize.INTEGER, allowNull: false },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('itens_pedido');
  },
};
