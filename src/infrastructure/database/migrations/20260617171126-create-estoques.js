'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estoques', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'produtos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantidade: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('estoques', {
      fields: ['unidade_id', 'produto_id'],
      type: 'unique',
      name: 'uq_estoque_unidade_produto',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estoques');
  },
};
