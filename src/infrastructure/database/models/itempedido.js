'use strict';

// O precoUnitario é guardado para o valor do pedido não mudar caso o preço do produto seja alterado depois.
module.exports = (sequelize, DataTypes) => {
  const ItemPedido = sequelize.define(
    'ItemPedido',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pedido_id',
      },
      produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'produto_id',
      },
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'preco_unitario',
      },
      // Resultado de quantidade * precoUnitario.
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'itens_pedido',
      underscored: true,
    }
  );

  // Relacionamentos do ItemPedido com Pedido e Produto.
  ItemPedido.associate = (db) => {
    ItemPedido.belongsTo(db.Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
    ItemPedido.belongsTo(db.Produto, { foreignKey: 'produtoId', as: 'produto' });
  };

  return ItemPedido;
};