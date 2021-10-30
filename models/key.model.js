const { DataTypes } = require("sequelize");
const db = require("../config/database");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Key = db.define(
  "Key",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.INTEGER(6),
    },
    activeKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiredDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    enum: {
      type: DataTypes.INTEGER, // 1 email activator, 2 password reset key, 3 otp
      defaultValue: 1,
      primaryKey: true,
    },
  },
  {
    indexes: [
      {
        name: "key_activation",
        fields: ["activeKey", "enum", "expiredDate"],
      },
      {
        name: "otp_management",
        fields: ["userId", "otp", "enum", "expiredDate"],
      },
      {
        name: "key_generator",
        fields: ["activeKey"],
      }
    ],
  }
);

Key.generateOtp = () => {
  let len = 6;
  let result = '';
  let characters = '0123456789';
  let charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

Key.generateKey = async (len) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < len; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
  let newKey = result;
  let data = await Key.findOne({ where: { activeKey: newKey }});
  return data === null ? newKey : generateKey(len);
};

module.exports = Key;
