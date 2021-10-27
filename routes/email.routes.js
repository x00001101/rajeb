const EmailController = require("../controllers/email.controller");
const PermissionMiddleware = require("../middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../middlewares/auth.validation.middleware");

exports.routesConfig = (app) => {
  //user email verification
  app.get("/emails/verify/:userId", [
    EmailController.userEmailVerification,
  ]);

  //request new email verification
  app.post("/emails/requestNewVerification", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyInactiveUserCanDoThisAction,
    EmailController.requestNewVerification,
  ]);

  //request reset password
  app.post("/emails/resetPasswordRequest", [
    EmailController.resetPasswordRequest,
  ]);
};
