const RegionController = require("./controllers/region.controller");
const ConverterController = require("./controllers/converter.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("./middlewares/verify.data.middleware");

const SUPER_USER = process.env.SUPER_USER;

exports.routesConfig = (app) => {
  app.get("/regions", [RegionController.getRegion]);

  app.post("/converters", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    DataValidatorMiddleware.verifyDataRequestForCreatingNewConverter,
    ConverterController.setNewConverter,
  ]);

  app.get("/converters", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    ConverterController.getAllConverter,
  ]);
};
