require('dotenv').config();
const storage = process.env.DB_STORAGE || './database.sqlite';
const config = { dialect: 'sqlite', storage, logging: false };
module.exports = { development: config, test: config, production: config };