exports.verifyDataRequestForCreatingNewConverter = (req, res, next) => {
  let output = {};
  output.output = null;
  output.success = false;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    output.message = "Need body data to pass!";
    return res.status(400).send(output);
  }
  let error_fields = [];
  if (!req.body.converterName || req.body.converterName === "") {
    error_fields.push("converterName");
  }
  if (!req.body.converterValue || req.body.converterValue === "") {
    error_fields.push("converterValue");
  }
  output.fields = error_fields;
  output.error_message = "fields can not be empty!";
  if (error_fields.length > 0) {
    return res.status(400).send(output);
  } else {
    return next();
  }
};
