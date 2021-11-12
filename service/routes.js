const ServiceController = require("./controllers/service.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");

const SUPER_USER = process.env.SUPER_USER;

exports.routesConfig = (app) => {
  app.post("/services", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    DataValidatorMiddleware.verifyDataRequestForCreatingNewService,
    ServiceController.createNewService,
  ]);

  app.get("/services", [ServiceController.getAllServicesData]);

  app.post("/prices", [
    DataValidatorMiddleware.verifyDataRequestForGetPrice,
    ServiceController.getPrice,
  ]);
};
