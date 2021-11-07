const OrderController = require("./controllers/order.controller");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");

exports.routesConfig = (app, socket) => {
  //create new order
  app.post("/orders", [
    DataValidatorMiddleware.verifyDataRequestForOrderProcess,
    OrderController.createNewOrder(socket),
  ]);
};
