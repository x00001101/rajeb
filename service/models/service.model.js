const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const Service = db.define("Service", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  setPrice: {
    type: DataTypes.INTEGER(12),
    allowNull: false,
  },
  additionalPrice: DataTypes.STRING,
  description: DataTypes.STRING,
});

module.exports = Service;
