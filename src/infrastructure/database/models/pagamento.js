'use strict';

module.exports = (sequelize, DataTypes) => {
  const Pagamento = sequelize.define(
    'Pagamento',
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
      status: {
        type: DataTypes.ENUM('PENDENTE', 'APROVADO', 'RECUSADO'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // Id que o gateway externo (mock) retornaria em uma integração real.
      transacaoExternaId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'transacao_externa_id',
      },
      // JSON de retorno do gateway.
      payloadRetorno: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'payload_retorno',
      },
    },
    {
      tableName: 'pagamentos',
      underscored: true,
    }
  );

  // Relacionamento do Pagamento com o Pedido.
  Pagamento.associate = (db) => {
    Pagamento.belongsTo(db.Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
  };

  return Pagamento;
};