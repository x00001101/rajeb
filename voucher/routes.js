const VoucherController = require("./controllers/voucher.controller");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");

const ADMIN = process.env.ADMIN;
const CUSTOMER = process.env.CUSTOMER;

exports.routesConfig = (app) => {
  app.post("/vouchers", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    DataValidatorMiddleware.dataVerification("verifyDataRequestForCreatingVoucher"),
    VoucherController.createNewVoucher
  ]);

  app.patch("/claim/:userId/:voucherId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(CUSTOMER),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    VoucherController.addToPouch
  ]);

  app.get("/vouchers/:voucherId", [VoucherController.voucherDetail]);

  app.get("/vouchers", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    VoucherController.allVouchers
  ]);
}