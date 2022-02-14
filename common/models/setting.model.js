const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Setting = db.define(
  "Setting",
  {
    id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    converter: DataTypes.INTEGER(10),
    courierPercentage: DataTypes.DECIMAL(10, 2),
    ootPercentage: DataTypes.DECIMAL(10, 2),
    courierPercentageBonus: DataTypes.DECIMAL(10, 2),
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = Setting;
