const { Post, Tracking, Billing, Envelope, Wallet } = require("../../common/models/main.model");
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
  const originVillage = await Village.findOne({ where: { id: originId } });
  if (originVillage === null) {
    error.push("Origin Id is not found!");
  } else {
    const originDistrict = originVillage.DistrictId;
    // find post origin id
    const originPost = await Post.findOne({
      where: { regionId: originDistrict },
    });
    if (originPost === null) {
      error.push("Service is not available within origin id");
    }
  }

  const destinationVillage = await Village.findOne({
    where: { id: destinationId },
  });
  if (destinationVillage === null) {
    error.push("Destination Id is not found!");
  } else {
    const destinationDistrict = destinationVillage.DistrictId;
    // find post destination id
    const destinationPost = await Post.findOne({
      where: { regionId: destinationDistrict },
    });
    if (destinationPost === null) {
      error.push("Service is not available within destination id");
    }
  }

  // err handling
  if (error.length > 0) {
    return res.status(403).send({ status: false, error: error });
  } else {
    next();
  }
};

exports.checkIfOrderHasAlreadyHadSameTrackingCode = async (req, res, next) => {
  const track = await Tracking.findOne({
    where: { orderId: req.params.orderId, codeId: req.body.codeId },
  });
  if (track === null) {
    return next();
  } else {
    return res.status(403).send({
      status: false,
      message: "Order has already had Code " + req.body.codeId,
    });
  }
};

exports.orderIsPaid = async (req, res, next) => {
  const billing = await Billing.findOne({
    where: { OrderId: req.params.orderId, paid: true },
  });
  if (billing === null) {
    return res
      .status(403)
      .send({ success: false, error: "Order is not paid!" });
  }
  return next();
};

exports.checkEnvelopeAndWalletUser = async (req, res, next) => {
  const envelope = await Envelope.findOne({ where: { UserId: req.jwt.userId }});
  if (envelope === null) {
    return res.status(404).send({ success: false, error: "Envelope Null"});
  }  
  const wallet = await Wallet.findOne({ where: { UserId: req.jwt.userId }});
  if (wallet === null) {
    return res.status(404).send({ success: false, error: "Wallet Null"});
  }
  return next();
}