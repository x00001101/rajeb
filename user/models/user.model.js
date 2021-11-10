const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");
const EmailModel = require("../../email/models/email.model");
const KeyModel = require("../../key/models/key.model");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      type: DataTypes.ENUM("1","5","15","2063","6159"),
      allowNull: false
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

User.createNewUser = async (host, newUser, result) => {
  let newKey = await KeyModel.generateKey(128);
  User.create(newUser)
    .then((data) => {
      let expired = new Date();
      expired.setDate(expired.getDate() + 1);
      const keyData = {
        userId: data.id,
        otp: null,
        activeKey: newKey,
        expiredDate: expired,
        enum: 1,
      };
      KeyModel.upsert(keyData, { where: { userId: data.id, enum: 1 } });
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
