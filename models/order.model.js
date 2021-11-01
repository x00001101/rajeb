const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Order = db.define(
  "Order",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    senderFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderOrigin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipientFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientOrigin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    name: "order_id",
    field: ["id"],
  },
);