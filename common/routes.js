const RegionController = require('./controllers/region.controller');

exports.routesConfig = (app) => {
  app.get("/regions", [RegionController.getRegion]);
}