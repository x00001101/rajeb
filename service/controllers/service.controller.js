const { Service } = require("../../common/models/main.model");
const ConverterModel = require("../../common/models/converter.model");

const output = {};

const prices = async (serviceId, weight, height, width, long) => {
  const output = {};
  output.serviceId = serviceId;
  output.weight = weight;
  output.height = height;
  output.long = long;
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
};

exports.createNewService = (req, res) => {
  const newService = {
    id: req.body.id,
    name: req.body.name,
    setPrice: req.body.set_price,
    description: req.body.description,
  };
  Service.create(newService)
    .then(() => {
      output.success = true;
      output.message = "New service created!";
      res.status(201).send(output);
    })
    .catch((err) => res.status(400).send(err));
};

exports.getAllServicesData = (req, res) => {
  Service.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.getPrice = async (req, res) => {
  let weight = req.body.item_weight;
  let height = req.body.item_height;
  let width = req.body.item_width;
  let long = req.body.item_long;
  let serviceId = req.params.serviceId;

  const data = await prices(serviceId, weight, height, width, long);
  res.send(data);
};
