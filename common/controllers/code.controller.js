const { Code, Type, CodeAttribute } = require("../models/main.model");
// test qr
const QRcode = require("qrcode");

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
  Code.findAll({ ...limoff, include: CodeAttribute })
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

exports.setCodeAttribute = async (req, res) => {
  if (!req.params.codeId) {
    return res.status(403).send({ success: false, error: "Need Code Id!" });
  }
  // find code that is valued
  const codeAttribute = await CodeAttribute.findOne({
    where: { CodeId: req.params.codeId, value: req.body.value },
  });
  if (codeAttribute != null) {
    return res.status(403).send({
      success: false,
      error: "Code already has " + req.body.value + " value",
    });
  }
  const code = await Code.findOne({ where: { id: req.params.codeId } });
  try {
    const attribute = await CodeAttribute.create({
      value: req.body.value,
    });
    attribute.setCode(code);
    res.send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
};

exports.testQr = (req, res) => {
  QRcode.toString("Test he", { type: "terminal" }, function (err, url) {
    console.log(url);
    res.send();
  });
};

exports.deleteCode = (req, res, next) => {
  Code.destroy({ where: { id: req.params.codeId } })
    .then(() => {
      res.send();
    })
    .catch((err) => next(err));
};

exports.getAllAttributes = (req, res) => {
  CodeAttribute.findAll({ where: { CodeId: req.params.codeId } })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
