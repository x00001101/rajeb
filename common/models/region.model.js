const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Province = db.define(
  "Province",
  {
    id: {
      type: DataTypes.STRING(2),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "provinces",
  },
);

const Regency = db.define(
  "Regency",
  {
    id: {
      type: DataTypes.STRING(4),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    tableName: "regencies",
  },
);

Regency.belongsTo(Province);

const District = db.define(
  "District",
  {
    id: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    tableName: "districts",
  }
);

District.belongsTo(Regency);

const Village = db.define(
  "Village",
  {
    id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "villages",
  },
);

Village.belongsTo(District);

exports.Province = Province;
exports.Regency = Regency;
exports.District = District;
exports.Village = Village;