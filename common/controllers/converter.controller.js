const Converter = require("../models/converter.model");

exports.setNewConverter = (req, res) => {
  Converter.upsert(
    {
      value: req.body.converterValue,
    },
    {
      where: { id: 1 },
    }
  )
    .then((data) => {
      let output = {};
      output.success = true;
      output.output = data;
      output.message = "Converter Created!";
      res.send(output);
    })
    .catch((err) => res.status(500).send(err));
};

exports.getAllConverter = (req, res) => {
  Converter.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
