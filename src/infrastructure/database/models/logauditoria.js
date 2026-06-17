'use strict';

module.exports = (sequelize, DataTypes) => {
  const LogAuditoria = sequelize.define(
    'LogAuditoria',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: true, // pode ser null em ações automáticas do sistema
        field: 'usuario_id',
      },
      acao: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entidade: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entidadeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'entidade_id',
      },
      detalhe: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'logs_auditoria',
      underscored: true,
    }
  );

  // Relacionamento do LogAuditoria com o Usuario que realizou a ação.
  LogAuditoria.associate = (db) => {
    LogAuditoria.belongsTo(db.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  };

  return LogAuditoria;
};