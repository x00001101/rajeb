const { DataTypes } = require("sequelize");
const db = require("../config/database");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Email = db.define(
  "Email",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
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
      type: DataTypes.INTEGER,
      defaultValue: 1,
      primaryKey: true,
    },
  },
  {
    indexes: [
      {
        name: "id_active",
        fields: ["userId", "activeKey", "enum", "expiredDate"],
      },
      {
        name: "email",
        fields: ["email"],
      },
    ],
  }
);

Email.generateKey = async (len) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < len; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
  return result;
};

Email.sendMail = (email, subject, contentTxt, contentHtml) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USERNAME,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    },
  });

  let mailOption = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: subject,
    text: contentTxt,
    html: contentHtml,
  };

  transporter.sendMail(mailOption, (err) => {
    if (err) {
      console.log("Error: ", err);
    }
    console.log("Sent to ", email);
  });
};

module.exports = Email;
