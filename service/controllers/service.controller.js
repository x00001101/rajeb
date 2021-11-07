const ServiceModel = require("../models/service.model");
const ConverterModel = require("../../common/models/converter.model");

exports.createNewService = (req, res) => {
  res.send({ message: "service here" });
};

exports.setPrice = async (req, res) => {
  let weight = req.body.item_weight;
  let height = req.body.item_height;
  let width = req.body.item_width;
  let tall = req.body.item_tall;
  let serviceId = req.params.serviceId;

  let output = {};
  let service = await ServiceModel.findOne({ where: { id: serviceId } });
  if (height != 0 && width != 0 && tall != 0) {
    const converterValue = await ConverterModel.findOne();
    const weightTotal = (height * width * tall) / converterValue.value;
    if (Math.round(weightTotal) > Math.round(weight)) {
      output.price = Math.round(weightTotal) * service.setPrice;
    } else {
      output.price = Math.round(weight) * service.setPrice;
    }
    return res.send(output);
  }
  output.price = Math.round(weight) * service.setPrice;
  return res.send(output);
};
