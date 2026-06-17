'use strict';

// Saldo de pontos de fidelidade do cliente. So vai existir se o cliente consentir (LGPD).
module.exports = (sequelize, DataTypes) => {
  const Fidelidade = sequelize.define(
    'Fidelidade',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'cliente_id',
      },
      saldoPontos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'saldo_pontos',
      },
    },
    {
      tableName: 'fidelidades',
      underscored: true,
    }
  );

  Fidelidade.associate = (db) => {
    Fidelidade.belongsTo(db.Usuario, { foreignKey: 'clienteId', as: 'cliente' });
  };

  return Fidelidade;
};