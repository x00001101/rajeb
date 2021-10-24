const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database');
const crypto = require('crypto');

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
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  }
});

async function generateId(len) {
  let size = parseInt(len/2);
  const { randomBytes } = await crypto;
  const buf = randomBytes(size);
  let newId = buf.toString('hex');
  let findId = await User.findOne({ where: { id: newId }});
  return findId === null ? newId : generateId(len);
};

User.createNew = (newUser, result) => {
  generateId(50).then(newId => {
    User.create({ id: newId , ...newUser })
    .then(() => {
      result(null, { id: newId });
    })
    .catch(err => result(err, null));
  });
};

module.exports = User;