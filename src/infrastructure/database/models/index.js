'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config);
const db = {};

fs.readdirSync(__dirname)
  .filter((f) => f !== 'index.js' && f.endsWith('.js'))
  .forEach((f) => {
    const model = require(path.join(__dirname, f))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((nome) => { if (db[nome].associate) db[nome].associate(db); });

db.sequelize = sequelize;
module.exports = db;