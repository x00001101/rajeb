const CourierController = require("../controllers/courier.controller");
const PermissionMiddleware = require("../middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../middlewares/auth.validation.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;
const CUSTOMER = process.env.CUSTOMER;
const GUEST = process.env.GUEST;

exports.routesConfig = (app) => {
  app.get("/courier", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyAdminAndPermitedPermissionLevelRequired(
      Number(GUEST) + Number(CUSTOMER) + Number(COURIER)
    ),
    CourierController.courierProfile,
  ]);
};
