'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      canal_pedido: {
        type: Sequelize.ENUM('APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'AGUARDANDO_PAGAMENTO',
          'PAGO',
          'EM_PREPARO',
          'PRONTO',
          'ENTREGUE',
          'CANCELADO',
          'PAGAMENTO_RECUSADO'
        ),
        allowNull: false,
        defaultValue: 'AGUARDANDO_PAGAMENTO',
      },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      forma_pagamento: { type: Sequelize.STRING, allowNull: false, defaultValue: 'MOCK' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pedidos');
  },
};
