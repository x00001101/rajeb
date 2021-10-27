const CustomerController = require("../controllers/customer.controller");
const PermissionMiddleware = require("../middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../middlewares/auth.validation.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;
const CUSTOMER = process.env.CUSTOMER;
const GUEST = process.env.GUEST;

const PERMITED_GUEST = Number(GUEST);
const PERMITED_CUSTOMER = Number(PERMITED_GUEST) + Number(CUSTOMER);
const PERMITED_COURIER = Number(PERMITED_CUSTOMER) + Number(COURIER);

exports.routesConfig = (app) => {
  app.get("/customer", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyActiveUserCanDoThisAction,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(PERMITED_CUSTOMER),
    CustomerController.customerPage,
  ]);
};
