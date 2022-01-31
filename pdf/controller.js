const pdfModel = require("./model");

exports.createNewPdf = async (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send("Need Id Parameter");
  }
  try {
    var binaryResult = await pdfModel.createPdf(req.query.id);
    res.contentType("application/pdf").send(binaryResult);
  } catch (err) {
    console.log(err);
    res.send(
      "<h2>There was an error displaying the PDF document.</h2> Error message: " +
        err.message
    );
  }
};
