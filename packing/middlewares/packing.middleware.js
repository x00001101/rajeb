const { Packing, PackingList } = require("../../common/models/main.model");

exports.packingIsInCheckingMode = async (req, res, next) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  const packing = await Packing.findOne({
    where: { id: req.params.packingId, status: "CHECKING" },
  });
  if (packing === null) {
    return res
      .status(400)
      .send({ success: false, message: "Packing is in Checking" });
  }
  return next();
};

exports.packingIsNotInCheckingMode = async (req, res, next) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  const packing = await Packing.findOne({
    where: { id: req.params.packingId, status: "CHECKING" },
  });
  if (packing === null) {
    return next();
  }
  return res
    .status(400)
    .send({ success: false, message: "Packing is in Checking" });
};

exports.packingIsNotDone = async (req, res, next) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  const packing = await Packing.findOne({
    where: { id: req.params.packingId, status: "DONE" },
  });
  if (packing === null) {
    return next();
  }
  return res.status(400).send({ success: false, message: "Packing is Done!" });
};

exports.packingIsUnLocked = async (req, res, next) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  // check if packing is locked
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (packing === null) {
    return res.status(404).send({ error: "Wrong Packing ID!" });
  } else {
    if (packing.status == "LOCKED") {
      return res.status(403).send({ error: "Packing is locked" });
    }
  }
  return next();
};

exports.packingIsLocked = async (req, res, next) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  // check if packing is locked
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (packing === null) {
    return res.status(404).send({ error: "Wrong Packing ID!" });
  } else {
    if (packing.status == "UNLOCKED") {
      return res.status(403).send({ error: "Packing is already Unlocked" });
    }
  }
  return next();
};
