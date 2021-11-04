const OrderModel = require('../models/order.model');
const BillingModel = require('../../billing/models/billing.model');
const CounterModel = require('../../common/models/counter.model');

exports.createNewOrder = (socket) => {
  return async (req, res) => {
    let output = {};

    // create new order
    let counter = 1;
    const today = new Date();
    const month = today.getMonth(); // this return month start from 0 - 11
    const year = today.getYear(); // this return year
    const month_year = month.toString()+year.toString();
    const counterNumber = await CounterModel.findOne({ where: { name: 'RESI', month_year: month_year }});
    let counterId;
    if (counterNumber === null) {
      counterId = await CounterModel.generateId();
      CounterModel.create({
        id: counterId,
        name: 'RESI',
        month_year: month_year,
        counter: 1
      });
    } else {
      counter += Number(counterNumber.counter); 
      counterId = counterNumber.id;
      CounterModel.update({ counter: counter }, { where: { id: counterId }});
    }
    const awbNumber = counterId.toString() + CounterModel.pad(counter, 6);
    output.output = awbNumber;
    output.success = true;
    output.message = "Order successfully created";
    if (socket) {
      // do le notif
    }
    res.send(output);
  };
};