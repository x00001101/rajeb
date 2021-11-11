const PostModel = require("../models/post.model");
const { Region } = require("../../common/models/region.model");

exports.createNew = async (req, res) => {
  const dataRegion = await Region.getFullRegionName(req.body.region_id);
  const regencyDataName = dataRegion.District.Regency.name;
  const regencyName = regencyDataName.split(" ");
  const postId = req.body.id;
  const regionName =
    dataRegion.name +
    ", " +
    dataRegion.District.name +
    ", " +
    dataRegion.District.Regency.name +
    ", " +
    dataRegion.District.Regency.Province.name;
  const Post = {
    id: postId,
    name: req.body.name,
    regionId: req.body.region_id,
    regionName: regionName,
    type: req.body.type,
  };
  PostModel.create(Post)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
