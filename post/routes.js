const PostController = require("./controllers/post.controller");
const PermissionMiddleware = require("../auth/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../auth/middlewares/auth.validation.middleware");
const DataValidatorMiddleware = require("../common/middlewares/verify.data.middleware");

const ADMIN = process.env.ADMIN;
const COURIER = process.env.COURIER;

exports.routesConfig = (app) => {
  app.post("/posts", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    DataValidatorMiddleware.dataVerification("CreateNewPost"),
    PostController.createNew,
  ]);

  app.get("/posts", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(COURIER),
    PostController.findAllPosts,
  ]);

  app.delete("/posts/:postId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
    PostController.deletePost,
  ]);
};
