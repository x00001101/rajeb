const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");
const Order = require("../../order/models/order.model");

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

Billing.Order = Billing.belongsTo(Order);

module.exports = Billing;