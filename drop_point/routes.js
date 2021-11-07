const DPController = require("./controllers/drop_point.controller");

exports.routesConfig = (app) => {
  app.post("/dps", [DPController.createNew]);
};
