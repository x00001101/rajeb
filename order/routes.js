const OrderController = require("./controllers/order.controller");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;
const CUSTOMER = process.env.CUSTOMER;
const GUEST = process.env.GUEST;

const PERMITED_GUEST = Number(GUEST);
const PERMITED_CUSTOMER = Number(PERMITED_GUEST) + Number(CUSTOMER);
const PERMITED_COURIER = Number(PERMITED_CUSTOMER) + Number(COURIER);

exports.routesConfig = (app, socket) => {
  //create new order
  app.post("/orders", [
    ValidationMiddleware.validJWTNeededOrNext,
    DataValidatorMiddleware.dataVerification("verifyDataRequestForOrderProcess"),
    OrderController.createNewOrder(socket),
  ]);

  app.patch("/orders/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    DataValidatorMiddleware.dataVerification("verifyDataRequestForPatchingOrders"),
    OrderController.patchOrder,
  ]);

  app.get("/tracking", [OrderController.trackOrder]);
};
