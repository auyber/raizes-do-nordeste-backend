'use strict';

// Model de Usuario. O campo "perfil" define as permissões (role) na aplicação.
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    'Usuario',
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      // Armazena apenas o hash da senha, e não o valor original.
      senhaHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'senha_hash',
      },
      perfil: {
        type: DataTypes.ENUM('ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'),
        allowNull: false,
        defaultValue: 'CLIENTE',
      },
      // Consentimento exigido pela LGPD para uso de dados no programa de fidelidade.
      consentimentoFidelidade: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'consentimento_fidelidade',
      },
      consentimentoData: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'consentimento_data',
      },
    },
    {
      tableName: 'usuarios',
      underscored: true,
    }
  );

  // Relacionamentos do Usuario com as demais tabelas.
  Usuario.associate = (db) => {
    Usuario.hasMany(db.Pedido, { foreignKey: 'clienteId', as: 'pedidos' });
    Usuario.hasOne(db.Fidelidade, { foreignKey: 'clienteId', as: 'fidelidade' });
    Usuario.hasMany(db.LogAuditoria, { foreignKey: 'usuarioId', as: 'logs' });
  };

  return Usuario;
};