const PackingController = require("./controllers/packing.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;

exports.routesConfig = (app) => {
  app.post("/packings", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.createNewPacking,
  ]);

  // patch data per orderId
  app.patch("/packings/:packingId/one/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.addOneDataOrderToPacking,
  ]);

  // patch data multiple orderId
  app.patch("/packings/:packingId/multi", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.addMultipleDataOrderToPacking,
  ]);

  // lock packing
  app.patch("/packings/:packingId/lock", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.lockPacking,
  ]);

  // remove one order id from packing
  app.patch("/packings/:packingId/remove/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.removeOrderFromPacking,
  ]);
};
