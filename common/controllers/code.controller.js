const { Code, Type } = require("../models/main.model");

let output = {};

exports.createNewCode = (req, res) => {
  const newCode = {
    id: req.body.id,
    name: req.body.name,
    description: req.body.description,
  };
  Code.create(newCode).then((data) => {
    output.success = true;
    output.message = "New Code has been saved";
    res.status(200).send({ ...output, ...data.dataValues });
  });
};

exports.getAllCodes = (req, res) => {
  let limoff = {};
  if (req.query.lim) {
    limoff.limit = Number(req.query.lim);
  }
  if (req.query.off) {
    limoff.offset = Number(req.query.off);
  }
  Code.findAll({ ...limoff })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(500).send(err));
};

exports.createNewTypeCode = (req, res) => {
  output.success = false;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }
  Type.create({ id: req.body.id, description: req.body.description })
    .then((data) => {
      output.success = true;
      res.send({
        ...output,
        ...data,
      });
    })
    .catch((err) => res.status(500).send(err));
};

exports.getAllTypes = (req, res) => {
  Type.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.deleteType = (req, res) => {
  Type.destroy({ where: { id: req.params.typeId } })
    .then(() => res.send())
    .catch((err) => res.status(500).send(err));
};
