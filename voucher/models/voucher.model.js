const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");

const Voucher = db.define(
  "Voucher",
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("PERCENT", "VALUE"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    maxValue: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    },
    expiredDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "-1 for unlimited",
      defaultValue: -1,
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "-1 for unlimited, limit per user",
      defaultValue: -1,
    }
  }
);

const Pouch = db.define(
  "Pouch",
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
  },
  {
    indexes: [
      {
        name: "user",
        fields: ["userId"]
      }
    ],
    createdAt: false,
    updatedAt: false,
  }
);

Voucher.hasMany(Pouch, { onDelete: 'cascade' });
Pouch.belongsTo(Voucher);

exports.Voucher = Voucher;
exports.Pouch = Pouch;