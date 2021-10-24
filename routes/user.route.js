const UserController = require('../controllers/user.controller');

exports.routesConfig = (app) => {
  //create new user
  app.post("/users", [
    UserController.createUser
  ]);
}