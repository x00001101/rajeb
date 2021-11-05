const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Converter = db.define("Converter", {
  name: DataTypes.STRING,
  value: DataTypes.DECIMAL(10, 2),
});

module.exports = Converter;
