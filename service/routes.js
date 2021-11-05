const ServiceController = require("./controllers/service.controller");

exports.routesConfig = (app) => {
  app.get("/services", [ServiceController.createNewService]);
};
