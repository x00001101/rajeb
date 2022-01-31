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
    covered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  }
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
    },
    covered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  }
);

Province.hasMany(Regency);
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
    },
    covered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  }
);

Regency.hasMany(District);
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
    covered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  }
);

District.hasMany(Village);
Village.belongsTo(District);

const Region = {
  getFullRegionName: async (regionId) => {
    const data = await Village.findOne({
      where: { id: regionId },
      include: [
        {
          model: District,
          required: true,
          attributes: ["name"],
          include: [
            {
              model: Regency,
              required: true,
              attributes: ["name"],
              include: [
                {
                  model: Province,
                  required: true,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      attributes: ["name"],
    });
    return data;
  },
};

exports.Province = Province;
exports.Regency = Regency;
exports.District = District;
exports.Village = Village;
exports.Region = Region;
