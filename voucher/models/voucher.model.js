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
    expiredDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: DataTypes.TEXT,
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