const { Sequelize } = require('sequelize');
const sequelize = require('../index');

const Counter = sequelize.define('counters', {
  trxId: {
    unique: true,
    type: Sequelize.STRING,
    allowNull: false
  },
}, {
  charset: 'utf8mb4',
  timestamps: false,
  indexes: [{
    fields: ['trxId']
  }]
});

Counter.sync();

module.exports = Counter;