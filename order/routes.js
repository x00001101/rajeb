const OrderController = require('./controllers/order.controller');

exports.routesConfig = (app, socket) => {
  //create new order
  app.post("/orders", [OrderController.createNewOrder(socket)]);
}