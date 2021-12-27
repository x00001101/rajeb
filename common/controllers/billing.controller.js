const { BillingType } = require("../models/main.model");

exports.createBillingType = (req, res) => {
  BillingType.create({
    id: req.body.id,
    autoPaid: req.body.autoPaid,
    payToCust: req.body.payToCust,
    description: req.body.description,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(500).send());
};

exports.getAllBillingTypes = (req, res) => {
  BillingType.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};
