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
      res.status(201).send(output);
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
  let serviceId = req.body.serviceId;

  const data = await ServiceModel.prices(
    serviceId,
    weight,
    height,
    width,
    long
  );
  res.send(data);
};
