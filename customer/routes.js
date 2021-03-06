const CustomerController = require("./controllers/customer.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;
const CUSTOMER = process.env.CUSTOMER;
const GUEST = process.env.GUEST;

const PERMITED_GUEST = Number(GUEST);
const PERMITED_CUSTOMER = Number(PERMITED_GUEST) + Number(CUSTOMER);
const PERMITED_COURIER = Number(PERMITED_CUSTOMER) + Number(COURIER);

exports.routesConfig = (app, socket) => {
  app.get("/customer", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyActiveUserCanDoThisAction,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_CUSTOMER
    ),
    CustomerController.customerPage(socket),
  ]);
  app.get("/customer/orders/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    CustomerController.customerOrderHistory,
  ]);
};
