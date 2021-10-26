const { DataTypes } = require('sequelize');
const db = require('../config/database');
const crypto = require('crypto');
const Email = require('./email.model');

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
},
{
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      name: 'email',
      fields: ['email']
    },
    {
      name: 'id',
      fields: ['id']
    }
  ]
}
);

async function generateId(len) {
  let size = parseInt(len/2);
  const { randomBytes } = await crypto;
  const buf = randomBytes(size);
  let newId = buf.toString('hex');
  let findId = await User.findOne({ where: { id: newId }});
  return findId === null ? newId : generateId(len);
};

User.createNew = (host, newUser, result) => {
  generateId(50).then(newId => {
    User.create({ id: newId , ...newUser })
    .then(data => {
      Email.generateKey(128).then(key => {

        //create temporary activation key 
        let expired = new Date();
        expired.setDate(expired.getDate() + 1);
        Email.create({ userId: data.id, email: data.email, activeKey: key, expiredDate: expired, enum: 1 });
        //send email verification
        let subject = 'Email verification';
        let contentTxt = host + '/emails/verify/' + data.id + '/' + key;
        let contentHtml = host + '/emails/verify/' + data.id + '/' + key;
        Email.sendMail(data.email, subject, contentTxt, contentHtml);

      })
      .catch(err => console.log('error generating key'));
      result(null, { id: data.id });
    })
    .catch(err => result(err, null));
  });
};

module.exports = User;