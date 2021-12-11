const {
  User,
  Code,
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
    { status: "LOCKED" },
    { where: { id: req.params.packingId } }
  );
  // add tracking code send to destination
  await PackingList.findAll({
    where: { PackingId: req.params.packingId },
  }).then(async (data) => {
    const packingHeader = await Packing.findOne({
      where: { id: req.params.packingId },
    });
    const user = await User.findOne({ where: { id: req.jwt.userId } });
    const post = await Post.findOne({
      where: { id: packingHeader.fromPostId },
    });
    const code = await Code.findOne({ where: { id: req.body.codeId } });
    for await (const list of data) {
      const order = await Order.findOne({ where: { id: list.OrderId } });
      try {
        const track = await Tracking.create({
          description: req.body.description,
          packing: true,
        });
        track.setCode(code);
        track.setOrder(order);
        track.setPost(post);
        track.setUser(user);
      } catch (err) {
        console.log(err);
      }
    }
  });
  res.send(packing);
};

exports.removeOrderFromPacking = async (req, res) => {
  const orderInPacking = await PackingList.findOne({
    where: {
      PackingId: req.params.packingId,
      OrderId: req.params.orderId,
    },
  });
  const packing = await Packing.findOne({
    where: { id: req.params.packingId },
  });
  if (orderInPacking === null) {
    return res
      .status(404)
      .send({ error: "Order ID not found in this Packing ID!" });
  }
  await PackingList.destroy({
    where: {
      PackingId: req.params.packingId,
      OrderId: req.params.orderId,
    },
  });
  await Packing.update(
    { total: Number(packing.total) - 1 },
    { where: { id: req.params.packingId } }
  );
  res.send();
};

exports.unlockPacking = async (req, res) => {
  const packing = await Packing.update(
    {
      status: "UNLOCKED",
    },
    {
      where: {
        id: req.params.packingId,
      },
    }
  );
  // also clear all tracking that created using packing lock process
  await PackingList.findAll({
    where: { PackingId: req.params.packingId },
  }).then(async (data) => {
    for await (const list of data) {
      await Tracking.destroy({
        where: { packing: true, OrderId: list.OrderId },
      });
    }
  });
  res.send(packing);
};

exports.getPackingList = async (req, res) => {
  if (!req.params.packingId) {
    return res.status(403).send({ error: "Need packing id!" });
  }
  const packinglist = await PackingList.findAll({
    where: { PackingId: req.params.packingId },
  });
  res.send(packinglist);
};
