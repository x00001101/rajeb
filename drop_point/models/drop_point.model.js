const { DataTypes, Op } = require("sequelize");
const db = require("../../common/config/database");

const DP = db.define("DropPoint", {
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
  phoneNumber: DataTypes.STRING,
});

DP.createId = async (dpName, rearId) => {
  if (rearId === undefined) {
    rearId = 0;
  }
  rearId = Number(rearId) + 1;
  const frontId = dpName.substring(0, 3);
  const newId = frontId.toUpperCase() + "-" + rearId;
  const data = await DP.findOne({ where: { id: newId } });
  if (data !== null) {
    const lastData = await DP.findAll({
      limit: 1,
      where: { id: { [Op.like]: frontId.toUpperCase() + "%" } },
      order: [["createdAt", "DESC"]],
    });
    let lastId = lastData[0].id;
    let idNum = lastId.split("-");
    let num = idNum[1];
    rearId = Number(num);
  }
  return data === null ? newId : DP.createId(dpName, rearId);
};

module.exports = DP;
