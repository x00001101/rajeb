const OrderController = require("./controllers/order.controller");
const OrderMiddleware = require("./middlewares/order.middleware");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");

const pdfController = require("../pdf/controller");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;
const CUSTOMER = process.env.CUSTOMER;
const GUEST = process.env.GUEST;

const PERMITED_GUEST = Number(GUEST);
const PERMITED_CUSTOMER = Number(PERMITED_GUEST) + Number(CUSTOMER);
const PERMITED_COURIER = Number(PERMITED_CUSTOMER) + Number(COURIER);

exports.routesConfig = (app, socket, io) => {
  //create new order
  app.post("/orders", [
    ValidationMiddleware.validJWTNeededOrNext,
    DataValidatorMiddleware.dataVerification(
      "verifyDataRequestForOrderProcess"
    ),
    OrderMiddleware.postChecking,
    OrderController.createNewOrder(socket),
  ]);

  // middleware post checking
  app.post("/orders/mid/pc", [OrderMiddleware.postChecking]);

  app.patch("/orders/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    DataValidatorMiddleware.dataVerification(
      "verifyDataRequestForPatchingOrders"
    ),
    OrderMiddleware.orderIsPaid,
    OrderMiddleware.checkIfOrderHasAlreadyHadSameTrackingCode,
    OrderController.patchOrder,
  ]);

  app.get("/orders/:orderId/tracks", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    OrderController.courierTracksOrder(ADMIN),
  ]);

  app.get("/orders/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    OrderController.getOrderDetail,
  ]);

  app.get("/tracking", [OrderController.trackOrder]);

  app.delete("/orders/:orderId", [OrderController.deleteOrder]);

  // set payment method for billing
  app.patch("/billings/:billingId/pm", [
    DataValidatorMiddleware.dataVerification(
      "verifyDataRequestForBillingPaymentMethod"
    ),
    OrderController.setBillingPaymentMethod,
  ]);

  // confirm payment
  app.patch("/billings/:billingId/cp", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    OrderMiddleware.checkEnvelopeAndWalletUser,
    OrderController.confirmPayment,
  ]);

  // finish order
  app.patch("/orders/:orderId/f", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    OrderController.finishOrder,
  ]);

  //pdf Awb
  app.get("/createPdfAwb", [
    // ValidationMiddleware.validJWTNeeded,
    pdfController.createNewPdf,
  ]);
};
