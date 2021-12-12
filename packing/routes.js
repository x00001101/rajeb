const PackingController = require("./controllers/packing.controller");
const PackingMiddleware = require("./middlewares/packing.middleware");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const VerifyDataMiddleware = require("../common/middlewares/verify.data.middleware");

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
    VerifyDataMiddleware.dataVerification("verifyDataRequestForPackingLock"),
    PackingMiddleware.packingIsNotInCheckingMode,
    PackingMiddleware.packingIsNotDone,
    PackingMiddleware.packingIsUnLocked,
    PackingController.lockPacking,
  ]);

  // remove one order id from packing
  app.patch("/packings/:packingId/remove/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingMiddleware.packingIsUnLocked,
    PackingController.removeOrderFromPacking,
  ]);

  // get packing list
  app.get("/packinglist/:packingId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingController.getPackingList,
  ]);

  // unlock packing if there's user error.
  app.patch("/packings/:packingId/unlock", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    PackingMiddleware.packingIsNotInCheckingMode,
    PackingMiddleware.packingIsNotDone,
    PackingMiddleware.packingIsLocked,
    PackingController.unlockPacking,
  ]);

  // scan packing list
  app.patch("/packings/:packingId/scan", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingMiddleware.packingIsNotInCheckingMode,
    PackingMiddleware.packingIsNotDone,
    PackingMiddleware.packingIsLocked,
    PackingController.setPackingToChecking,
  ]);

  // check order id inside packing
  app.patch("/packings/:packingId/check/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingMiddleware.packingIsInCheckingMode,
    PackingController.checkOrderIdInsidePacking,
  ]);

  // cancel packing check
  app.patch("/packings/:packingId/cancel", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    PackingMiddleware.packingIsInCheckingMode,
    PackingController.cancelCheckingOrderInsidePacking,
  ]);

  // set to done
  app.patch("/packings/:packingId", [
    ValidationMiddleware.validJWTNeeded,
    VerifyDataMiddleware.dataVerification("verifyDataRequestForPackingDone"),
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PackingMiddleware.packingIsNotDone,
    PackingMiddleware.packingIsInCheckingMode,
    PackingController.setPackingDone,
  ]);
};
