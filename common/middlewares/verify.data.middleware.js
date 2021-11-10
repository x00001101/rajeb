const ServiceModel = require("../../service/models/service.model");
const { Village } = require("../models/region.model");

const output = {};
output.output = null;
output.success = false;
output.error_message = "fields can not be empty!";

let error_fields = [];

let requirements = [];

async function checkRequirements(requirements, req) {
  let errors = [];
  await requirements.forEach((requirement) => {
    if (
      !req.body[requirement] ||
      req.body[requirement] === "" ||
      typeof req.body[requirement] === "undefined"
    ) {
      errors.push(requirement);
    }
  });
  return errors;
}

exports.verifyDataRequestForCreatingNewConverter = async (req, res, next) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }

  requirements = ["converterValue"];

  error_fields = await checkRequirements(requirements, req);

  output.fields = error_fields;
  error_fields = [];
  if (output.fields.length > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};

exports.verifyDataRequestForGetPrice = async (req, res, next) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }

  requirements = ["item_weight"];

  error_fields = await checkRequirements(requirements, req);

  output.fields = error_fields;
  error_fields = [];
  if (output.fieldslength > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};

exports.verifyDataRequestForOrderProcess = async (req, res, next) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }

  requirements = [
    "senderFullName",
    "senderPhoneNumber",
    "senderOriginId",
    "senderPostCode",
    "recipientFullName",
    "recipientPhoneNumber",
    "recipientDestinationId",
    "recipientAddress",
    "recipientPostCode",
    "serviceId",
    "itemTypeId",
    "itemWeight",
  ];

  error_fields = await checkRequirements(requirements, req);

  //check service if its available
  let serviceId = req.body.serviceId;
  const service = await ServiceModel.findOne({ where: { id: serviceId } });
  if (service === null) {
    return res.status(400).send({ error: "Service Id is not available" });
  }

  let villageId = req.body.senderOriginId;
  const villageOrigin = await Village.findOne({ where: { id: villageId } });
  if (villageOrigin === null) {
    return res.status(400).send({ error: "Origin Id is not found" });
  }
  villageId = req.body.recipientDestinationId;
  const villageDestination = await Village.findOne({
    where: { id: villageId },
  });
  if (villageOrigin === null) {
    return res.status(400).send({ error: "Destination Id is not found" });
  }

  output.fields = error_fields;
  error_fields = [];
  if (output.fields.length > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};

exports.verifyDataRequestForCreatingNewService = async (req, res, next) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }

  requirements = ["name"];

  error_fields = await checkRequirements(requirements, req);

  output.fields = error_fields;
  error_fields = [];
  if (output.fields.length > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};
