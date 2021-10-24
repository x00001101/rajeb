const UserController = require('../controllers/user.controller');

exports.routesConfig = (app) => {
  app.get("/", [UserController.createUser]);
}