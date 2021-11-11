const { Order, Billing, Tracking } = require("../models/order.model");
const { customAlphabet } = require("nanoid/async");
const CounterModel = require("../../common/models/counter.model");
const ServiceModel = require("../../service/models/service.model");
const VoucherModel = require("../../voucher/models/voucher.model");
const CodeModel = require("../../common/models/code.model");
const PostModel = require("../../post/models/post.model");

const nanoid = customAlphabet("0123456789", 12);

let output = {};

const generateBillingId = async () => {
  const newId = await nanoid();
  const billingId = await Billing.findOne({ where: { id: newId } });
  return billingId === null ? newId : generateBillingId(newId);
};

exports.createNewOrder = (socket) => {
  return async (req, res) => {
    if (socket) {
      // here for notification
    }
    const serviceId = req.body.serviceId;
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

    // this is order
    const orderObject = {
      id: awbNumber,
      senderFullName: req.body.senderFullName,
      senderPhoneNumber: req.body.senderPhoneNumber,
      senderOriginId: req.body.senderOriginId,
      senderAddress: req.body.senderAddress,
      senderPostCode: req.body.senderPostCode,
      recipientFullName: req.body.recipientFullName,
      recipientPhoneNumber: req.body.recipientPhoneNumber,
      recipientDestinationId: req.body.recipientDestinationId,
      recipientAddress: req.body.recipientAddress,
      recipientPostCode: req.body.recipientPostCode,
      serviceId: req.body.serviceId,
      itemName: req.body.itemName,
      itemTypeId: req.body.itemTypeId,
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

    // this is billing

    // get service price amount;
    let serviceAmount = 0;
    const service = await ServiceModel.findOne({ where: { id: req.body.serviceId }});
    if (service !== null) {
      serviceAmount = service.dataValues.setPrice;
    } else {
      output.success = false;
      output.error = "Not Found!";
      output.field = "Service Id";
      output.message = "Service not found!"
      return res.status(404).send(output);
    }

    // set the voucher amount
    let voucherAmount = 0;
    // get voucher amount from voucher id using model
    if (req.body.voucherId) {
      const voucher = await VoucherModel.findOne({ where: { id: req.body.voucherId }});
      if (voucher !== null) {
        const voucherVal = voucher.dataValues;
        // get voucher type;
        if (voucherVal.type === "PERCENT") {
          voucherAmount = Number(serviceAmount) * Number(voucherVal.value) / 100; 
        } else if (voucherVal.type === "VALUE") {
          voucherAmount = voucherVal.value;
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
      insuranceAmount = Number(itemValue) * 0.02 / 100;
    }

    // set total amount;
    const totalAmount = Number(serviceAmount) - Number(voucherAmount) + Number(insuranceAmount);

    const billingObject = {
      id: billingId,
      voucherAmount: voucherAmount,
      insuranceAmount: insuranceAmount,
      serviceAmount: serviceAmount,
      totalAmount: totalAmount,
      paid: false,
    };

    // insert data to table 
    Promise.all([
      Order.create(orderObject),
      Billing.create(billingObject),
    ])
    .then(([order, billing]) => {
      Promise(billing.setOrder(order));
    })
    .catch(err => res.status(500).send(err));

    output.success = true;
    output.awbNumber = awbNumber;
    output.billingId = billingId;
    res.send(output);
  };
};

exports.patchOrder = async (req, res) => {
  if (!req.params.orderId) {
    output.success = false;
    output.error = "Need to set Order Id as Parameter";
    return res.status(400).send(output);
  }

  output.success = false;
  const code = await CodeModel.findOne({ where: { id: req.params.codeId }});
  if (code === null) {
    output.error = "Code not found";
    return res.status(404).send(output);
  }

  const post = await PostModel.findOne({ where: { id: req.params.postId }});
  if (post === null) {
    output.error = "Post not found";
    return res.status(404).send(output);
  }  

  try {
    const order = await Order.findOne({ where: { id: req.params.orderId }});

    const track = await Tracking.create({
      codeId: req.params.codeId,
      postId: req.params.postId,
      userId: req.jwt.userId,
      description: req.body.description,
    });

    track.setOrder(order);
    output.success = true;
    res.send(output);
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
    where:
    {
      id: [...id]
    },
    include: [
      {
        model: Tracking,
      }
    ]
  })
  .then(data => res.send(data))
  .catch(err => res.status(500).send(err));
}