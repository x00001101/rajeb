const OrderModel = require('../models/order.model');

exports.createNewOrder = (socket) => {
  return (req, res) => {
    if (socket) {
      // do le notif
    }
    let output = {};
    output.success = true;
    output.message = "Order successfully created";
    res.send(output);
  };
};