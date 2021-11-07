const ServiceModel = require("../models/service.model");
const ConverterModel = require("../../common/models/converter.model");

const output = {};

exports.createNewService = (req, res) => {
  const Service = {
    id: req.body.id,
    name: req.body.name,
    setPrice: req.body.set_price,
    description: req.body.description,
  };
  ServiceModel.create(Service)
    .then(() => {
      output.success = true;
      output.message = "New service created!";
      res.send(output);
    })
    .catch((err) => res.status(400).send(err));
};

exports.getAllServicesData = (req, res) => {
  ServiceModel.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.getPrice = async (req, res) => {
  let weight = req.body.item_weight;
  let height = req.body.item_height;
  let width = req.body.item_width;
  let long = req.body.item_long;
  let serviceId = req.params.serviceId;

  let service = await ServiceModel.findOne({ where: { id: serviceId } });
  if (height != 0 && width != 0 && long != 0) {
    const converterValue = await ConverterModel.findOne();
    if (converterValue === null) {
      output.error = "Converter value not set!";
      return res.status(400).send(output);
    }
    const weightTotal = (height * width * long) / converterValue.value;
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
