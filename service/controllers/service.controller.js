const { Service, prices } = require("../../common/models/main.model");

let output = {};

exports.createNewService = (req, res) => {
  const newService = {
    id: req.body.id,
    name: req.body.name,
    setPrice: req.body.set_price,
    description: req.body.description,
  };
  Service.create(newService)
    .then((data) => {
      output.success = true;
      output.message = "New service created!";
      res.status(201).send({ ...output, ...data.dataValues });
    })
    .catch((err) => res.status(400).send(err));
};

exports.getAllServicesData = (req, res) => {
  Service.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.getPrice = async (req, res) => {
  const weight = req.query.item_weight;
  const height = req.query.item_height;
  const width = req.query.item_width;
  const long = req.query.item_long;
  const origin = req.query.origin;
  const destination = req.query.destination;

  const serviceId = req.params.serviceId;
  const service = await Service.findOne({ where: { id: serviceId } });

  const data = await prices(
    service.setPrice,
    weight,
    height,
    width,
    long,
    origin,
    destination
  );
  res.send(data);
};
