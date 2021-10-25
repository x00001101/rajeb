const { DataTypes } = require('sequelize');
const db = require('../config/database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Email = db.define('Email', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activeKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiredDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  enum: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    primaryKey: true
  }
},
{
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      name: 'id_active',
      fields: ['userId', 'activeKey', 'enum', 'expiredDate']
    }
  ]
});

Email.generateKey = async (len) => {
  let size = parseInt(len/2);
  const { randomBytes } = await crypto;
  const buf = randomBytes(size);
  return buf.toString('hex');
};

Email.sendMail = (email, subject, contentTxt, contentHtml) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  let mailOption = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: subject,
    text: contentTxt,
    html: contentHtml
  };

  transporter.sendMail(mailOption, err => {
    if (err) {
      console.log('Error: ', err);
    }
    console.log('Sent to ', email);
  });
};

module.exports = Email;