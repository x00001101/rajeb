const { Service } = require("../models/main.model");
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

exports.dataVerification = (title) => {
  return async (req, res, next) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      output.message = "Need body data to pass!";
      return res.status(400).send(output);
    }
    if (title === "verifyDataRequestForCreatingNewConverter") {
      requirements = [
        "converter",
        "courierPercentage",
        "ootPercentage",
        "courierPercentageBonus",
      ];
    } else if (title === "verifyDataRequestForBillingPaymentMethod") {
      requirements = ["billingTypeId"];
    } else if (title === "verifyDataRequestForGetPrice") {
      requirements = ["item_weight"];
    } else if (title === "verifyDataRequestForCreateBilling") {
      requirements = ["id", "billingAutoPaid"];
    } else if (title === "verifyDataRequestForPackingDone") {
      requirements = ["codeId", "postId"];
    } else if (title === "verifyDataRequestForPackingLock") {
      requirements = ["codeId"];
    } else if (title === "verifyDataRequestForCreatingNewService") {
      requirements = ["name"];
    } else if (title === "verifyDataRequestForPatchingOrders") {
      requirements = ["codeId"];
    } else if (title === "verifyDataRequestForCreatingVoucher") {
      requirements = ["id", "name", "type", "value", "maxValue", "expiredDate"];
    } else if (title === "verifyDataRequestForOrderProcess") {
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
      //check service if its available
      let serviceId = req.body.serviceId;
      const service = await Service.findOne({ where: { id: serviceId } });
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
      if (villageDestination === null) {
        return res.status(400).send({ error: "Destination Id is not found" });
      }
    } else if (title === "CreateNewPost") {
      requirements = ["id", "name", "region_id", "type"];
    }
    error_fields = await checkRequirements(requirements, req);
    output.fields = error_fields;
    error_fields = [];
    if (output.fields.length > 0) {
      return res.status(400).send(output);
    } else {
      return next();
    }
  };
};
