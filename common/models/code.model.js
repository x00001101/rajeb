const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const Code = db.define(
  "Code",
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = Code;