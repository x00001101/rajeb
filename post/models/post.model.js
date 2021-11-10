const { DataTypes, Op } = require("sequelize");
const db = require("../../common/config/database");

const Post = db.define("Post", {
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
  type: {
    type: DataTypes.ENUM("DP","GT"),
    allowNull: false,
    defaultValue: "DP",
  }
});

module.exports = Post;
