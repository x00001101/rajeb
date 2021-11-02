const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");
const EmailModel = require("../../email/models/email.model");
const KeyModel = require("../../key/models/key.model");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissionLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["phoneNumber"],
      },
      {
        name: "email",
        fields: ["email"],
      },
      {
        name: "id",
        fields: ["id"],
      },
      {
        name: "phone",
        fields: ["phoneNumber"],
      },
    ],
  }
);

async function generateId(len) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  let newId = result;
  let findId = await User.findOne({ where: { id: newId } });
  return findId === null ? newId : generateId(len);
}

User.createNewUser = async (host, newUser, result) => {
  let newId = await generateId(50);
  let newKey = await KeyModel.generateKey(128);
  User.create({ id: newId, ...newUser })
    .then((data) => {
      let expired = new Date();
      expired.setDate(expired.getDate() + 1);
      const keyData = {
        userId: newId,
        otp: null,
        activeKey: newKey,
        expiredDate: expired,
        enum: 1,
      };
      KeyModel.upsert(keyData, { where: { userId: newId, enum: 1 } });
      const fields = {
        email: data.email,
        type: "EMAIL_VERIFICATION",
        url: host + "/emails/verify?verification_token=" + newKey,
        key: newKey,
      };
      EmailModel.sendEmail(fields);
      result(null, data);
    })
    .catch((err) => result(err, null));
};

module.exports = User;
