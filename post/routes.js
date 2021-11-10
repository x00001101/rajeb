const DPController = require("./controllers/post.controller");

exports.routesConfig = (app) => {
  app.post("/posts", [DPController.createNew]);
};
