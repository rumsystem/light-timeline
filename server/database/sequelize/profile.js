

const { Sequelize } = require('sequelize');
const sequelize = require('../index');

const Profile = sequelize.define('profiles', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  avatar: {
    type: Sequelize.TEXT,
    defaultValue: ''
  },
  groupId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userAddress: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
}, {
  charset: 'utf8mb4',
  timestamps: false,
  indexes: [{
    unique: true,
    fields: ['groupId', 'userAddress']
  }]
});

Profile.sync();

module.exports = Profile;