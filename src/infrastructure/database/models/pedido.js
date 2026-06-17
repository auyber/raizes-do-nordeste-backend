'use strict';

// Pedido feito por um cliente em uma unidade.
// canalPedido é obrigatório pois indica de onde o pedido foi originado.
module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define(
    'Pedido',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'cliente_id',
      },
      unidadeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'unidade_id',
      },
      // Canal de origem do pedido.
      canalPedido: {
        type: DataTypes.ENUM('APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'),
        allowNull: false,
        field: 'canal_pedido',
      },
      status: {
        // Fluxo principal: AGUARDANDO_PAGAMENTO -> PAGO -> EM_PREPARO -> PRONTO -> ENTREGUE
        // Caminhos alternativos: PAGAMENTO_RECUSADO e CANCELADO.
        type: DataTypes.ENUM(
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
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      // Pagamento simulado (MOCK) por padrão.
      formaPagamento: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'MOCK',
        field: 'forma_pagamento',
      },
    },
    {
      tableName: 'pedidos',
      underscored: true,
    }
  );

  // Relacionamentos do Pedido com cliente, unidade, itens e pagamento.
  Pedido.associate = (db) => {
    Pedido.belongsTo(db.Usuario, { foreignKey: 'clienteId', as: 'cliente' });
    Pedido.belongsTo(db.Unidade, { foreignKey: 'unidadeId', as: 'unidade' });
    Pedido.hasMany(db.ItemPedido, { foreignKey: 'pedidoId', as: 'itens' });
    Pedido.hasOne(db.Pagamento, { foreignKey: 'pedidoId', as: 'pagamento' });
  };

  return Pedido;
};