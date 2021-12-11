// const { Order, Billing, Tracking } = require("../models/order.model");
const {
  User,
  Order,
  Billing,
  Tracking,
  Voucher,
  Pouch,
  Service,
  Code,
  Post,
  Type,
  prices,
} = require("../../common/models/main.model");
const { customAlphabet } = require("nanoid/async");
const CounterModel = require("../../common/models/counter.model");
const { Village } = require("../../common/models/region.model");

const nanoid = customAlphabet("0123456789", 12);

let output = {};

const generateBillingId = async () => {
  const newId = await nanoid();
  const billingId = await Billing.findOne({ where: { id: newId } });
  return billingId === null ? newId : generateBillingId(newId);
};

exports.createNewOrder = (socket) => {
  return async (req, res) => {
    output = {};
    const origin = await Village.findOne({
      where: { id: req.body.senderOriginId },
    });
    if (origin === null) {
      return res.status(404).send({ error: "origin Id not found!" });
    }
    const destination = await Village.findOne({
      where: { id: req.body.recipientDestinationId },
    });
    if (destination === null) {
      return res.status(404).send({ error: "origin Id not found!" });
    }

    const type = await Type.findOne({ where: { id: req.body.itemTypeId } });
    if (type === null) {
      return res.status(404).send({ error: "Type Id not found!" });
    }
    const serviceId = req.body.serviceId;

    // this is billing

    // get service price amount;
    let serviceAmount = 0;
    const service = await Service.findOne({
      where: { id: req.body.serviceId },
    });
    if (service !== null) {
      serviceAmount = service.dataValues.setPrice;
      const priceData = await prices(
        serviceAmount,
        req.body.itemWeight,
        req.body.itemHeight,
        req.body.itemWidth,
        req.body.itemLong,
        req.body.senderOriginId,
        req.body.recipientDestinationId
      );
      serviceAmount = priceData.price;
      // set price
    } else {
      output.success = false;
      output.error = "Not Found!";
      output.field = "Service Id";
      output.message = "Service not found!";
      return res.status(404).send(output);
    }

    // set the voucher amount
    let voucherAmount = 0;
    let pouchId = null;
    // get voucher amount from voucher id using model

    const voucher = await Voucher.findOne({
      where: { id: req.body.voucherId },
    });
    if (req.body.voucherId || req.body.voucherId != "") {
      // check if the user has the voucher
      if (voucher !== null) {
        if (req.jwt) {
          const pouch = await Pouch.findOne({
            where: { userId: req.jwt.userId, voucherId: req.body.voucherId },
          });
          if (pouch === null) {
            output.success = false;
            output.error = "Not Found!";
            output.field = "Voucher Id";
            output.message = `User does not have the voucher ${req.body.voucherId}`;
            return res.status(404).send(output);
          }
          pouchId = pouch.id;
          // get voucher type;
          if (voucher.type === "PERCENT") {
            voucherAmount =
              (Number(serviceAmount) * Number(voucher.value)) / 100;
            if (voucherAmount > voucher.maxValue && voucher.maxValue > 0) {
              voucherAmount = voucher.maxValue;
            }
          } else if (voucher.type === "VALUE") {
            voucherAmount = voucher.value;
          }
        } else {
          output.success = false;
          output.message = "You need to login for using voucher";
          return res.status(404).send(output);
        }
      } else {
        output.success = false;
        output.error = "Not Found!";
        output.field = "Voucher Id";
        output.message = "Voucher not found!";
        return res.status(404).send(output);
      }
    }

    // set insurance amount
    let insuranceAmount = 0;
    if (req.body.insurance) {
      insuranceAmount = (Number(req.body.itemValue) * 0.02) / 100;
    }

    // set total amount;
    const totalAmount =
      Number(serviceAmount) - Number(voucherAmount) + Number(insuranceAmount);

    // create AWB number
    // find service and month year in counter

    let counter = 1;
    const today = new Date();
    const month = today.getMonth() + 1; // this return month and change it so it returns 1 to 12
    const year = today.getFullYear(); // this return full year e.g. 2021
    const month_year = month.toString() + year.toString(); // combine that two becomes mYYYYY 32021
    const counterNumber = await CounterModel.findOne({
      where: { name: serviceId, month_year: month_year },
    });
    // set the counterId
    let counterId;
    if (counterNumber === null) {
      counterId = await CounterModel.generateId();
      CounterModel.create({
        id: counterId,
        name: req.body.serviceId,
        month_year: month_year,
        counter: 1,
      });
    } else {
      counter += Number(counterNumber.counter);
      counterId = counterNumber.id;
      CounterModel.update({ counter: counter }, { where: { id: counterId } });
    }
    // finally the set AWB
    const awbNumber =
      serviceId + counterId.toString() + CounterModel.pad(counter, 6);

    // set billing id. just set it random using nanoid
    const billingId = await generateBillingId();

    if (!req.body.itemWidth) {
      req.body.itemWidth = 0;
    }
    if (!req.body.itemHeight) {
      req.body.itemHeight = 0;
    }
    if (!req.body.itemLong) {
      req.body.itemLong = 0;
    }
    let userId = null;
    if (req.jwt) {
      userId = req.jwt.userId;
    }
    // this is order
    const orderObject = {
      id: awbNumber,
      senderId: userId,
      senderFullName: req.body.senderFullName,
      senderPhoneNumber: req.body.senderPhoneNumber,
      senderAddress: req.body.senderAddress,
      senderPostCode: req.body.senderPostCode,
      recipientFullName: req.body.recipientFullName,
      recipientPhoneNumber: req.body.recipientPhoneNumber,
      recipientAddress: req.body.recipientAddress,
      recipientPostCode: req.body.recipientPostCode,
      itemName: req.body.itemName,
      itemWeight: req.body.itemWeight,
      itemQty: req.body.itemQty,
      itemDimension:
        req.body.itemWidth +
        "x" +
        req.body.itemHeight +
        "x" +
        req.body.itemLong,
      itemValue: req.body.itemValue,
      insurance: req.body.insurance,
      voucherId: req.body.voucherId,
    };

    const billingObject = {
      id: billingId,
      voucherAmount: voucherAmount,
      insuranceAmount: insuranceAmount,
      serviceAmount: serviceAmount,
      totalAmount: totalAmount,
      paid: false,
    };

    try {
      const newOrder = await Order.create(orderObject);

      newOrder.setService(service);
      newOrder.setOrigin(origin);
      newOrder.setDestination(destination);
      newOrder.setType(type);

      if (userId) {
        const UserData = await User.findOne({ where: { id: userId } });
        newOrder.setUser(UserData);
      }

      const newBilling = await Billing.create(billingObject);

      newBilling.setOrder(newOrder);

      if (pouchId) {
        Pouch.destroy({
          where: {
            id: pouchId,
          },
        });
      }

      if (req.body.voucherId || req.body.voucherId != "") {
        newOrder.setVoucher(voucher);
      }

      if (socket) {
        // here for notification
      }

      output.success = true;
      output.awbNumber = awbNumber;
      output.billingId = billingId;
      res.send(output);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  };
};

exports.patchOrder = async (req, res) => {
  output = {};
  output.success = false;
  if (!req.params.orderId) {
    output.error = "Need to set Order Id as Parameter";
    return res.status(400).send(output);
  }
  const code = await Code.findOne({ where: { id: req.body.codeId } });
  if (code === null) {
    output.error = "Code not found";
    return res.status(404).send(output);
  }
  if (!req.body.postId) {
    req.body.postId = null;
  }
  const post = await Post.findOne({ where: { id: req.body.postId } });
  if (post === null && req.body.postId !== null) {
    output.error = "Post not found!";
    return res.status(404).send(output);
  }
  const user = await User.findOne({ where: { id: req.jwt.userId } });
  if (user === null) {
    output.error = "User not found!";
    return res.status(404).send(output);
  }
  const order = await Order.findOne({ where: { id: req.params.orderId } });
  if (order === null) {
    output.error = "Order not found!";
    return res.status(404).send(output);
  }
  try {
    const track = await Tracking.create({
      description: req.body.description,
    });
    track.setCode(code);
    track.setOrder(order);
    track.setPost(post);
    track.setUser(user);
    output.success = true;
    res.send({
      ...output,
      code: { ...code.dataValues },
      order: { ...order.dataValues },
      post: { ...post.dataValues },
      userId: user.dataValues.id,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.trackOrder = (req, res) => {
  if (!req.query.id) {
    output.success = false;
    output.error = "Need to pass Order Id as Parameter";
    return res.status(400).send(output);
  }
  let id = req.query.id;
  id = id.split(",");

  Order.findAll({
    where: {
      id: [...id],
    },
    include: [
      {
        model: Village,
        as: "origin",
      },
      {
        model: Village,
        as: "destination",
      },
      {
        model: Tracking,
        include: [
          {
            model: Code,
            required: true,
            attributes: ["name", "description"],
          },
          {
            model: Post,
            attributes: ["name"],
          },
          {
            model: User,
            required: true,
            attributes: ["fullName", "phoneNumber"],
          },
        ],
      },
    ],
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.courierTracksOrder = (permited) => {
  return (req, res) => {
    Tracking.findAll({
      where: { orderId: req.params.orderId, UserId: req.jwt.userId },
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "phoneNumber", "permissionLevel"],
        },
      ],
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send();
      });
  };
};

exports.deleteOrder = async (req, res) => {
  // check if order is got tracked
  const tracking = await Tracking.findOne({
    where: { orderId: req.params.orderId },
  });
  if (tracking === null) {
    Order.destroy({ where: { id: req.params.orderId } });
    return res.send({ message: `${req.params.orderId} has been deleted!` });
  } else {
    return res
      .status(403)
      .send({ error: `This order ${req.params.orderId} can not be deleted!` });
  }
};
