const DropPointModel = require("../models/drop_point.model");
const { Region } = require("../../common/models/region.model");

exports.createNew = async (req, res) => {
  const dpId = DropPointModel.createId(req.body.name);
  const dataRegion = await Region.getFullRegionName(req.body.region_id);
  const regionName =
    dataRegion.name +
    ", " +
    dataRegion.District.name +
    ", " +
    dataRegion.District.Regency.name +
    ", " +
    dataRegion.District.Regency.Province.name;
  const DP = {
    id: dpId,
    name: req.body.name,
    regionId: req.body.region_id,
    regionName: regionName,
    phoneNumber: req.body.phone_number,
  };
  // DropPointModel.create({});
  res.send(DP);
};
