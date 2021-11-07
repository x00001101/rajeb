const { DataTypes } = require("sequelize");
const db = require("../config/database");

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
        fields: ['name', 'month_year'], 
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
}

Counter.generateId = async () => {
  let len = 6;
  let result = '';
  let characters = '0123456789';
  let charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  let data = await Counter.findOne({ where: { id: result }});
  return data === null ? result : generateId();
}

module.exports = Counter;