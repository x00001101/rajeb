const Setting = require("../models/setting.model");

exports.setNewSetting = (req, res) => {
  Setting.update(
    {
      converter: req.body.converter,
      courierPercentage: req.body.courierPercentage,
      ootPercentage: req.body.ootPercentage,
    },
    {
      where: { id: "SETTING" },
    }
  )
    .then((data) => {
      let output = {};
      output.success = true;
      output.output = data;
      output.message = "Setting Updated!";
      res.send(output);
    })
    .catch((err) => res.status(500).send(err));
};

exports.getAllSetting = (req, res) => {
  Setting.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
