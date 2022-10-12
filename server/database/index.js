const { Sequelize } = require('sequelize');
const config = require('../config');

const dbConfig = config.database;
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: () => {}
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(0);
  }
})();

module.exports = sequelize;