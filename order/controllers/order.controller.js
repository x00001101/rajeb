const OrderModel = require("../models/order.model");
const BillingModel = require("../../billing/models/billing.model");
const CounterModel = require("../../common/models/counter.model");
const ServiceModel = require("../../service/models/service.model");

exports.createNewOrder = (socket) => {
  return async (req, res) => {
    let output = {};

    // create new order
    let counter = 1;
    const today = new Date();
    const month = today.getMonth() + 1; // this return month and change it so it returns 1 to 12
    const year = today.getFullYear(); // this return full year e.g. 2021
    const month_year = month.toString() + year.toString(); // combine that two becomes mYYYYY 32021
    const counterNumber = await CounterModel.findOne({
      where: { name: req.body.serviceId, month_year: month_year },
    });
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
    const awbNumber = counterId.toString() + CounterModel.pad(counter, 6);

    // create billing 

    // billing ID
    let counterBill = 1;
    const counterBilling = await CounterModel.findOne({
      where: { name: "BILLING", month_year: month_year },
    });
    let billingId;
    if (counterBilling === null) {
      billingId = await CounterModel.generateId();
      CounterModel.create({
        id: billingId,
        name: "BILLING",
        month_year: month_year,
        counter: 1,
      });
    } else {
      counterBill += Number(counterBilling.counter);
      billingId = counterBilling.id;
      CounterModel.update({ counter: counterBill }, { where: { id: billingId } });
    }
    const billingIdCounter = billingId.toString() + CounterModel.pad(counterBill, 6);

    // voucher amount
    let voucher_amount = 0;
    // set up for later

    // insurance amount
    let insurance_amount = 0;
    if (req.body.insurance) {
      // insurance is 0.02% from total item invoice.
      insurance_amount = Number(req.body.itemValue) * 0.02 / 100;
    }

    // calculate the main amount price
    let amount_price = 0;
    let serviceId = req.body.serviceId;
    let weight = req.body.itemWeight;
    let height = req.body.itemHeight;
    let width = req.body.itemWidth;
    let long = req.body.itemLong;

    amount_price = await ServiceModel.prices(serviceId, weight, height, width, long);

    // calculate total price
    let total_amount = Number(amount_price.price) - Number(voucher_amount) + Number(insurance_amount);

    BillingModel.create({
      id: billingIdCounter, 
      voucherAmount: voucher_amount,
      insuranceAmount: insurance_amount,
      Amount: amount_price.price,
      totalAmount: total_amount,
      paid: false, 
      Order: {
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
      }
    }, {
      include: [ BillingModel.Order ]
    })
      .then((data) => {

        output.output = {
          orderId: data.id,
          billingId: billingIdCounter,
        };
        output.success = true;
        output.message = "Order successfully created";
        if (socket) {
          // do le notif
        }
        res.send(output);
      })
      .catch((err) => {
        // if this happens then counter will still updated as the order id was created
        let error_messages = [];
        if (err.name === "SequelizeValidationError") {
          const errors = err.errors;
          errors.forEach((value) => {
            error_messages.push(value.path + " can not be empty!");
          });
        } else {
          error_messages.push(
            "Something wrong happened at the kitchen, my bad"
          );
        }
        output.output = null;
        output.message = error_messages;
        output.success = false;
        res.status(400).send(output);
      });
  };
};
