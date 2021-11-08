const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Converter = db.define(
  "Converter", 
  {
    value: DataTypes.INTEGER(10),
  },
  {
    createdAt: false,
    updatedAt: false,
  },
);

module.exports = Converter;
