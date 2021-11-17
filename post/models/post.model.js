const { DataTypes } = require("sequelize");
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
    type: DataTypes.ENUM("DP","GT","TC"),
    allowNull: false,
    defaultValue: "DP",
    comment: "DP-Drop Point, GT-Gateway, TC-Transit Center",
  }
},
{
  createdAt: false,
  updatedAt: false,
}  
);

module.exports = Post;
