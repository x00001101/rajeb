const { BillingType } = require("../models/main.model");

exports.createBillingType = (req, res) => {
  BillingType.create({
    id: req.body.id,
    billingAutoPaid: req.body.billingAutoPaid,
    description: req.body.description,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(500).send());
};
