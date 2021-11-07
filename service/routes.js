const ServiceController = require("./controllers/service.controller");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");

exports.routesConfig = (app) => {
  app.post("/services", [ServiceController.createNewService]);

  app.post("/prices/:serviceId", [
    DataValidatorMiddleware.verifyDataRequestForSetPrice,
    ServiceController.setPrice,
  ]);
};
