const { DataTypes } = require("sequelize");
const db = require("../config/database");
const { customAlphabet } = require("nanoid/async");

const nanoid = customAlphabet("0123456789", 6);

const Counter = db.define(
  "Counter",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    month_year: DataTypes.STRING,
    counter: DataTypes.INTEGER,
  },
  {
    indexes: [
      {
        fields: ["name", "month_year"],
      },
    ],
    createdAt: false,
    updatedAt: false,
  }
);

Counter.pad = (number, size) => {
  number = number.toString();
  while (number.length < size) number = "0" + number;
  return number;
};

Counter.generateId = async () => {
  const result = await nanoid();
  let data = await Counter.findOne({ where: { id: result } });
  return data === null ? result : generateId();
};

module.exports = Counter;
