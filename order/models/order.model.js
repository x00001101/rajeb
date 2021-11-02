const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const Order = db.define(
  "Order",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    senderId: DataTypes.STRING,
    courierId: DataTypes.STRING,
    senderFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderOriginId: {
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
    recipientDestinationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemName: DataTypes.STRING,
    itemTypeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemQty: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    itemWeight: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    itemDimension: DataTypes.STRING,
    itemValue: DataTypes.INTEGER,
    insurance: DataTypes.BOOLEAN,
    voucherId: DataTypes.STRING(50),
  },
  {
    indexes: [
      {
        name: "order_id",
        fields: ["id"],
      },
    ]
  },
);

module.exports = Order;