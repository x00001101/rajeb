const RegionController = require("./controllers/region.controller");
const SettingController = require("./controllers/setting.controller");
const CodeController = require("./controllers/code.controller");
const BillingController = require("./controllers/billing.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("./middlewares/verify.data.middleware");
const CommonController = require("./controllers/common.controller");

const SUPER_USER = process.env.SUPER_USER;
const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;

exports.routesConfig = (app) => {
  app.get("/", (req, res) => {
    res.send({
      message:
        "You are currently accessing the Rest API for the JEB expedition system for more detailed information please visit https://x00001101.github.io/rajeb-docs",
    });
  });

  app.get("/regions", [RegionController.getRegion]);

  app.put("/settings", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    DataValidatorMiddleware.dataVerification(
      "verifyDataRequestForCreatingNewConverter"
    ),
    SettingController.setNewSetting,
  ]);

  app.get("/settings", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    SettingController.getAllSetting,
  ]);

  app.post("/codes", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    CodeController.createNewCode,
  ]);

  app.patch("/codes/:codeId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    CodeController.setCodeAttribute,
  ]);

  app.get("/codes", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    CodeController.getAllCodes,
  ]);

  app.post("/types", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    CodeController.createNewTypeCode,
  ]);

  app.delete("/types/:typeId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    CodeController.deleteType,
  ]);

  app.get("/types", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    CodeController.getAllTypes,
  ]);

  app.post("/billingtypes", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
    BillingController.createBillingType,
  ]);

  app.get("/billingTypes", [BillingController.getAllBillingTypes]);

  app.get("/testQr", [CodeController.testQr]);

  app.get("/regionName", [RegionController.getRegionName]);

  app.post("/push/notification", [
    CommonController.pushNotification
  ]);
};
