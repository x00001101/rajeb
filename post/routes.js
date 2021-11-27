const PostController = require("./controllers/post.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");

const ADMIN = process.env.ADMIN;

exports.routesConfig = (app) => {
  app.post("/posts", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    DataValidatorMiddleware.dataVerification("CreateNewPost"),
    PostController.createNew,
  ]);
};
