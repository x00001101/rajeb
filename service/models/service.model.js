const { DataTypes } = require("sequelize");
const db = require("../../common/config/database");
const ConverterModel = require("../../common/models/converter.model");

const Service = db.define("Service", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  setPrice: {
    type: DataTypes.INTEGER(12),
    allowNull: false,
  },
  description: DataTypes.STRING,
});

Service.prices = async (serviceId, weight, height, width, long) => {
  const output = {};
  let service = await Service.findOne({ where: { id: serviceId } });
  if (height != 0 && width != 0 && long != 0) {
    const converterValue = await ConverterModel.findOne();
    if (converterValue === null) {
      output.error = "Converter value not set!";
      return output;
    }
    const weightTotal = (height * width * long) / converterValue.value;
    if (Math.round(weightTotal) > Math.round(weight)) {
      output.price = Math.round(weightTotal) * service.setPrice;
    } else {
      output.price = Math.round(weight) * service.setPrice;
    }
    return output;
  }
  output.price = Math.round(weight) * service.setPrice;
  return output;
}

module.exports = Service;
