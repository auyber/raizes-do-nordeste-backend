'use strict';

// Produto do cardápio.
module.exports = (sequelize, DataTypes) => {
  const Produto = sequelize.define(
    'Produto',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descricao: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // Permite remover o produto do cardápio sem excluir o registro do banco.
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'produtos',
      underscored: true,
    }
  );

  // Relacionamentos do Produto com estoque e os itens de pedido.
  Produto.associate = (db) => {
    Produto.hasMany(db.Estoque, { foreignKey: 'produtoId', as: 'estoques' });
    Produto.hasMany(db.ItemPedido, { foreignKey: 'produtoId', as: 'itens' });
  };

  return Produto;
};