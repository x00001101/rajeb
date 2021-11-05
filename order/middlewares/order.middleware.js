exports.verifyDataBeforeProcess = (req, res, next) => {
  let output = {};
  output.output = null;
  output.success = false;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }
  let error_fields = [];
  if (!req.body.senderFullName || req.body.senderFullName === "") {
    error_fields.push("senderFullName");
  }
  if (!req.body.senderPhoneNumber || req.body.senderPhoneNumber === "") {
    error_fields.push("senderPhoneNumber");
  }
  if (!req.body.senderOriginId || req.body.senderOriginId === "") {
    error_fields.push("senderOriginId");
  }
  if (!req.body.senderAddress || req.body.senderAddress === "") {
    error_fields.push("senderAddress");
  }
  if (!req.body.senderPostCode || req.body.senderPostCode === "") {
    error_fields.push("senderPostCode");
  }
  if (!req.body.recipientFullName || req.body.recipientFullName === "") {
    error_fields.push("recipientFullName");
  }
  if (!req.body.recipientPhoneNumber || req.body.recipientPhoneNumber === "") {
    error_fields.push("recipientPhoneNumber");
  }
  if (
    !req.body.recipientDestinationId ||
    req.body.recipientDestinationId === ""
  ) {
    error_fields.push("recipientDestinationId");
  }
  if (!req.body.recipientAddress || req.body.recipientAddress === "") {
    error_fields.push("recipientAddress");
  }
  if (!req.body.recipientPostCode || req.body.recipientPostCode === "") {
    error_fields.push("recipientPostCode");
  }
  if (!req.body.serviceId || req.body.serviceId === "") {
    error_fields.push("serviceId");
  }
  if (!req.body.itemTypeId || req.body.itemTypeId === "") {
    error_fields.push("itemTypeId");
  }
  if (!req.body.itemWeight || req.body.itemWeight === "") {
    error_fields.push("itemWeight");
  }
  output.fields = error_fields;
  output.error_message = "fields can not be empty!";
  if (error_fields.length > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};
