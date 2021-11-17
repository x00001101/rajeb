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