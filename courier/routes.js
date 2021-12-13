const CourierController = require("./controllers/courier.controller");
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
  app.get("/courier", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyActiveUserCanDoThisAction,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    CourierController.courierPage(socket),
  ]);

  app.get("/courier/history", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      PERMITED_COURIER
    ),
    CourierController.courierHistory,
  ]);

  app.post("/courier/paycustomer/:orderId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired( PERMITED_COURIER
    ),
    
  ])
};
