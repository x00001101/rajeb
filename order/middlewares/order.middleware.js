const { Post } = require("../../common/models/main.model");
const { Village } = require("../../common/models/region.model");

exports.postChecking = async (req, res, next) => {
  let originId = req.body.senderOriginId;
  if (typeof originId === "undefined") {
    originId = "";
  }

  let destinationId = req.body.recipientDestinationId;
  if (typeof destinationId === "undefined") {
    destinationId = "";
  }

  let error = [];

  // check if post is available for shipment.
  //  origin drop point.
  //    get district id
  const originVillage = await Village.findOne({ where: { id: originId }});
  if ( originVillage === null ) {
    error.push("Origin Id is not found!");
  } else {
    const originDistrict = originVillage.DistrictId;
    // find post origin id 
    const originPost = await Post.findOne({ where: { regionId: originDistrict }});
    if ( originPost === null ) {
      error.push("Service is not available within origin id");
    }
  }

  const destinationVillage = await Village.findOne({ where: { id: destinationId }});
  if ( destinationVillage === null ) {
    error.push("Destination Id is not found!");
  } else {
    const destinationDistrict = destinationVillage.DistrictId;
    // find post destination id
    const destinationPost = await Post.findOne({ where: { regionId: destinationDistrict }});
    if ( destinationPost === null ) {
      error.push("Service is not available within destination id");
    }
  }

  // err handling
  if (error.length > 0) {
    return res.status(403).send({status: false, error: error});
  } else {
    next();
  }
}