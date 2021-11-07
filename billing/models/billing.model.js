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
    voucherAmmount: DataTypes.DECIMAL(10,2),
    insuranceAmmount: DataTypes.DECIMAL(10,2),
    Amount: DataTypes.DECIMAL(10,2),
    totalAmmount: DataTypes.DECIMAL(10,2),
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

Billing.belongsTo(Order);

module.exports = Billing;