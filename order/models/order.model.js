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

const Billing = db.define(
  "Billing",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    voucherAmount: DataTypes.DECIMAL(10,2),
    insuranceAmount: DataTypes.DECIMAL(10,2),
    Amount: DataTypes.DECIMAL(10,2),
    totalAmount: DataTypes.DECIMAL(10,2),
    paid: DataTypes.BOOLEAN,
  },
  {
    indexes: [
      {
        name: "id",
        fields: ["id"],
      }
    ]
  }
);

Order.hasOne(Billing);
Billing.belongsTo(Order);

const Tracking = db.define(
  "Tracking",
  {
    orderId: DataTypes.STRING,
    codeId: DataTypes.STRING,
    postId: DataTypes.STRING,
    userId: DataTypes.UUID,
    description: DataTypes.TEXT,
  }
);

exports.Order = Order;
exports.Billing = Billing;