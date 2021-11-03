const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const Billing = db.define(
  "Billing",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    voucherAmmount: DataTypes.DECIMAL(10,2),
    insuranceAmmount: DataTypes.DECIMAL(10,2),
    Amount: DataTypes.DECIMAL(10,2),
    totalAmmount: DataTypes.DECIMAL(10,2),
  },
  {
    indexes: [
      {
        name: "id",
        fields: ["id"],
      },
      {
        name: "order_id",
        fields: ["orderId"],
      }
    ]
  }
);

module.exports = Billing;