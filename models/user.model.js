const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permissionLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

User.createNew = (newUser, result) => {
  User.create({...newUser})
    .then(() => {
      result(null, newUser.id);
    })
    .catch(err => console.log(err));
  // console.log(newUser);
};

module.exports = User;