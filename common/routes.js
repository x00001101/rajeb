const RegionController = require("./controllers/region.controller");
const ConverterController = require("./controllers/converter.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("./middlewares/verify.data.middleware");

const SUPER_USER = process.env.SUPER_USER;

exports.routesConfig = (app) => {
  app.get("/", (req, res) => {
    res.send({message: "You are currently accessing the Rest API for the JEB expedition system for more detailed information please visit https://x00001101.github.io/rajeb-docs"})
  });
  
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
