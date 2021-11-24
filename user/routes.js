const UserController = require("./controllers/user.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");

const ADMIN = process.env.ADMIN;
const CUSTOMER = process.env.CUSTOMER;

exports.routesConfig = (app) => {
  //create new user
  app.post("/users", [
    PermissionMiddleware.toCreateAnAdminNeedAdminOrSuperUser,
    UserController.createUser,
  ]);

  //get all data users
  app.get("/users", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    UserController.findAllUsers,
  ]);

  //get one user
  app.get("/users/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UserController.findUserById,
  ]);

  //update data user
  app.patch("/users/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(CUSTOMER),
    PermissionMiddleware.onlyActiveUserCanDoThisAction,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UserController.updateDataUser,
  ]);

  //delete data user
  app.delete("/users/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    UserController.deleteUserById,
  ]);

  //reset password from email
  app.get("/password/reset", [UserController.resetPasswordConfirmation]);

  //reset password form
  app.patch("/password/reset_form", [UserController.resetPasswordForm]);

  //change password
  app.patch("/password/change/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UserController.changePassword,
  ]);

  //get id
  app.get("/usersData", [
    ValidationMiddleware.validJWTNeeded,
    UserController.getDataFromJWT
  ]);
};
