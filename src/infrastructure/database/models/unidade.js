'use strict';

// Unidade (loja) da rede. Cada unidade possui seu próprio estoque.
module.exports = (sequelize, DataTypes) => {
  const Unidade = sequelize.define(
    'Unidade',
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
      cidade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endereco: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Permite desativar uma unidade sem excluir o registro do banco.
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'unidades',
      underscored: true,
    }
  );

  // Relacionamentos da Unidade com estoque e pedidos.
  Unidade.associate = (db) => {
    Unidade.hasMany(db.Estoque, { foreignKey: 'unidadeId', as: 'estoques' });
    Unidade.hasMany(db.Pedido, { foreignKey: 'unidadeId', as: 'pedidos' });
  };

  return Unidade;
};