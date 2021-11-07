require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      multipleStatements: true,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection success...");
  })
  .catch((err) => console.log("Error :", err));

if (process.argv[2] === "build") {
  sequelize.sync().then(() => {
    if (process.argv[3] === "insert") {
      let file_path = path.join(__dirname, "..", "config", "indonesia.sql");
      let sql_queries = fs.readFileSync(file_path, "utf8");
      sequelize.query(sql_queries);
    }
  });
}

module.exports = sequelize;
