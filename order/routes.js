const OrderController = require("./controllers/order.controller");
const OrderMiddleware = require("./middlewares/order.middleware");

exports.routesConfig = (app, socket) => {
  //create new order
  app.post("/orders", [
    OrderMiddleware.verifyDataBeforeProcess,
    OrderController.createNewOrder(socket),
  ]);
};
