const EmailController = require("./controllers/email.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");

exports.routesConfig = (app) => {
  //user email verification
  app.get("/emails/verify", [EmailController.userEmailVerification]);

  //request new email verification
  app.get("/emails/requestNewVerification", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlyInactiveUserCanDoThisAction,
    EmailController.requestNewVerification,
  ]);

  //request reset password
  app.post("/emails/resetPasswordRequest", [
    ValidationMiddleware.validJWTNeeded,
    EmailController.resetPasswordRequest,
  ]);
};
