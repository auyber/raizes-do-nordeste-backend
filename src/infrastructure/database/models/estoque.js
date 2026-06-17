'use strict';

module.exports = (sequelize, DataTypes) => {
  const Estoque = sequelize.define(
    'Estoque',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      unidadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'unidade_id',
      },
      produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'produto_id',
      },
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'estoques',
      underscored: true,
      indexes: [
        // Garante que não exista o mesmo produto duplicado na mesma unidade.
        { unique: true, fields: ['unidade_id', 'produto_id'] },
      ],
    }
  );

  // Relacionamentos do Estoque com Unidade e Produto.
  Estoque.associate = (db) => {
    Estoque.belongsTo(db.Unidade, { foreignKey: 'unidadeId', as: 'unidade' });
    Estoque.belongsTo(db.Produto, { foreignKey: 'produtoId', as: 'produto' });
  };

  return Estoque;
};