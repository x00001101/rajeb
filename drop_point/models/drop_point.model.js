const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const DP = db.define("DropPoint", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  regionName: DataTypes.STRING,
  phoneNumber: DataTypes.STRING,
});

DP.createId = (dpName) => {
  return "TES";
};

module.exports = DP;
