const DropPointModel = require("../models/drop_point.model");
const { Region } = require("../../common/models/region.model");

exports.createNew = async (req, res) => {
  const dataRegion = await Region.getFullRegionName(req.body.region_id);
  let regencyDataName = dataRegion.District.Regency.name;
  let regencyName = regencyDataName.split(" ");
  const dpId = await DropPointModel.createId(regencyName[1]);
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
  DropPointModel.create(DP)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
