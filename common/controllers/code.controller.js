const Code = require("../models/code.model");

let output = {};

exports.createNewCode = (req, res) => {
  const newCode = {
    id: req.body.id,
    name: req.body.name,
    description: req.body.description
  };
  Code.create(newCode)
    .then(() => {
      output.success = true;
      output.message = "New Code has been saved";
      res.status(200).send(output);
    })
};

exports.getAllCodes = (req, res) => {
  let limoff = {};
  if (req.query.lim) {
    limoff.limit = Number(req.query.lim);
  }
  if (req.query.off) {
    limoff.offset = Number(req.query.off);
  }
  Code.findAll({...limoff})
    .then((data) => {
      res.send(data)
    })
    .catch(err => res.status(500).send(err));
};