const pdfModel = require("./model");

exports.createNewPdf = async (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send("Need Id Parameter");
  }
  try {
    var binaryResult = await pdfModel.createPdf(req.query.id);
    if (!binaryResult) {
      return res.status(404).send({message: "Order Id not found!"});
    } 
    res.contentType("application/pdf").send(binaryResult);
  } catch (err) {
    res.send(
      "<h2>There was an error displaying the PDF document.</h2> Error message: " +
        err.message
    );
  }
};