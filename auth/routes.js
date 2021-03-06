const VerifyUserMiddleware = require("../common/middlewares/verify.user.middleware");
const AuthorizationController = require("./controllers/authorization.controller");
const AuthValidationMiddleware = require("./middlewares/auth.validation.middleware");

exports.routesConfig = function (app) {
  // user authorization login
  app.post("/auth", [
    VerifyUserMiddleware.hasAuthValidFields,
    VerifyUserMiddleware.isPasswordAndUserMatch,
    AuthorizationController.login,
  ]);

  app.post("/auth/refresh", [
    AuthValidationMiddleware.validJWTNeeded,
    AuthValidationMiddleware.verifyRefreshBodyField,
    AuthValidationMiddleware.validRefreshNeeded,
    VerifyUserMiddleware.reloadDataForRefreshToken,
    AuthorizationController.login,
  ]);

  app.post("/auth/devid", [
    AuthValidationMiddleware.validJWTNeeded,
    AuthorizationController.registerDevId,
  ]);
};
