const {
  User,
  Code,
  Order,
  Packing,
  PackingList,
  Tracking,
  Post,
} = require("../../common/models/main.model");
const { Op, Model } = require("sequelize");

exports.createNewPacking = async (req, res) => {
  // Packing.create()
  //   .then((data) => res.status(201).send({ success: true, ...data.dataValues }))
  //   .catch((err) => res.status(500).send(err));
  // check if user is already create a packing but unfinished
  const userPacking = await Packing.findOne({
    where: {
      userId: req.jwt.userId,
      [Op.or]: [{ status: "UNLOCKED" }, { status: "CHECKING" }],
    },
  });

  if (userPacking) {
    return res.status(400).send({
      success: false,
      ...userPacking,
      message:
        "Could not create new Packing. Unfinished Packing ID " + userPacking.id,
    });
  }

  // check each postid is it available
  const from = await Post.findOne({ where: { id: req.body.from } });
  if (from === null) {
    return res.status(404).send({ error: "Post id 'from' not found!" });
  }
  const to = await Post.findOne({ where: { id: req.body.to } });
  if (to === null) {
    return res.status(404).send({ error: "Post id 'to' not found!" });
  }
  const user = await User.findOne({ where: { id: req.jwt.userId } });

  // then create the packing id
  try {
    const packing = await Packing.create();
    packing.setFromPost(from);
    packing.setToPost(to);
    packing.setUser(user);
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
  // const packinglist = await PackingList.findAll({
  //   where: { PackingId: req.params.packingId },
  // });
  const packinglist = await Packing.findOne({
    where: { id: req.params.packingId },
    include: PackingList,
  });

  res.send(packinglist);
};

exports.setPackingToChecking = async (req, res) => {
  const packing = await Packing.update(
    { status: "CHECKING" },
    { where: { id: req.params.packingId } }
  );
  res.send(packing);
};

exports.checkOrderIdInsidePacking = async (req, res) => {
  if (!req.params.orderId) {
    return res.status(403).send({ error: "Need Order Id!" });
  }
  const order = await Order.findOne({ where: { id: req.params.orderId } });
  if (order === null) {
    return res.status(404).send({ error: "Wrong Order Id!" });
  }
  // find order is inside the packing id
  const packinglist = await PackingList.findOne({
    where: { PackingId: req.params.packingId, OrderId: req.params.orderId },
  });
  if (packinglist === null) {
    return res
      .status(404)
      .send({ error: "Order Id is not found inside Packing List" });
  }
  const check = await PackingList.update(
    { checked: true },
    { where: { PackingId: req.params.packingId, OrderId: req.params.orderId } }
  );
  if (check[0] === 0) {
    return res
      .status(403)
      .send({ success: false, error: "Order is already checked!" });
  }
  res.send({ success: true });
};

exports.cancelCheckingOrderInsidePacking = async (req, res) => {
  await PackingList.update(
    { checked: false },
    { where: { PackingId: req.params.packingId } }
  );
  await Packing.update(
    { status: "LOCKED" },
    { where: { id: req.params.packingId } }
  );
  res.send();
};

exports.setPackingDone = async (req, res) => {
  // check all order data in packing list is done
  await PackingList.findAll({
    where: { PackingId: req.params.packingId },
  })
    .then(async (data) => {
      let error = [];
      const code = await Code.findOne({ where: { id: req.body.codeId } });
      if (code === null) {
        return res
          .status(404)
          .send({ success: false, error: "Code id not found!" });
      }
      // check if post is the same as the packing destination
      const packingDestination = await Packing.findOne({
        where: { id: req.params.packingId, toPostId: req.body.postId },
      });
      if (packingDestination === null) {
        console.log(packingDestination);
        return res.status(403).send({
          success: false,
          error: "Post id is not the Packing Destination Id",
        });
      }
      const post = await Post.findOne({ where: { id: req.body.postId } });
      if (post === null) {
        return res
          .status(404)
          .send({ success: false, error: "Post Id not found!" });
      }

      const user = await User.findOne({ where: { id: req.jwt.userId } });
      if (user === null) {
        return res
          .status(404)
          .send({ success: false, error: "User not found!" });
      }

      for await (list of data) {
        if (!list.checked) {
          error.push(list.OrderId);
        }
      }
      if (error.length > 0) {
        return res.status(403).send({
          success: false,
          error: "There are still unchecked Order in Packing list!",
          uncheckedOrder: error,
        });
      }
      for await (list of data) {
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
      await Packing.update(
        { status: "DONE" },
        { where: { id: req.params.packingId } }
      );
      res.send({ success: true });
    })
    .catch((err) => {
      res.status(500).send();
    });
};
