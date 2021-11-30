const {
  Order,
  Packing,
  PackingList,
  Tracking,
  Post,
} = require("../../common/models/main.model");

exports.createNewPacking = async (req, res) => {
  // Packing.create()
  //   .then((data) => res.status(201).send({ success: true, ...data.dataValues }))
  //   .catch((err) => res.status(500).send(err));
  // check each postid is it available
  const from = await Post.findOne({ where: { id: req.body.from } });
  if (from === null) {
    return res.status(404).send({ error: "Post id 'from' not found!" });
  }
  const to = await Post.findOne({ where: { id: req.body.to } });
  if (to === null) {
    return res.status(404).send({ error: "Post id 'to' not found!" });
  }
  // then create the packing id
  try {
    const packing = await Packing.create();
    packing.setFromPost(from);
    packing.setToPost(to);
    res.status(201).send({
      success: true,
      ...packing,
    });
  } catch (err) {
    res.status(500).send();
  }
};

exports.addOneDataOrderToPacking = async (req, res) => {
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (packing === null) {
    return req.status(404).send({ error: "Wrong Packing ID!" });
  }
  const order = await Order.findOne({ where: { id: req.params.orderId } });
  if (order === null) {
    return req.status(404).send({ error: "Order Id not found!" });
  }
  try {
    const packinglist = await PackingList.create();
    packinglist.setPacking(packing);
    packinglist.setOrder(order);
    Packing.update(
      { total: Number(packing.total) + 1 },
      { where: { id: packing.id } }
    );
    res.send({
      orderId: order.id,
      packingId: packing.id,
      message: `Order ${order.id} has been successfully added to Packing ${packing.id}`,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.addMultipleDataOrderToPacking = async (req, res) => {
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (packing === null) {
    return req.status(404).send({ error: "Wrong Packing ID!" });
  }
  // check the availability of order ids
  let error = [];
  const orderIds = req.body.orderIds;
  orderIds.forEach(async (element) => {
    const orderCheck = await Order.findOne({ where: { id: element } });
    if (orderCheck === null) {
      error.push(element);
    }
  });
  if (error.length > 0) {
    return res.status(404).send({
      error: "These order id(s) are not found!",
      success: false,
      orderIds: { ...error },
    });
  }
  try {
    const packinglist = await PackingList.create();
    packinglist.setPacking(packing);
    orderIds.forEach(async (element) => {
      const order = await Order.findOne({ where: { id: element } });
      packinglist.setOrder(order);
    });
    return res.send({
      success: true,
      orderIds: { ...orderIds },
      packingId: packing.id,
      message: `Orders has been successfully added to Packing ${packing.id}`,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.lockPacking = async (req, res) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  const packing = await Packing.update(
    { locked: true },
    { where: { id: req.params.packingId } }
  );
  res.send(packing);
};

exports.removeOrderFromPacking = async (req, res) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  // check if packing is locked
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (packing === null) {
    return req.status(404).send({ error: "Wrong Packing ID!" });
  } else {
    if (packing.locked) {
      return req.status(403).send({ error: "Packing is locked" });
    }
  }
};
