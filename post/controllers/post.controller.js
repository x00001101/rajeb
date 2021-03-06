const { Post } = require("../../common/models/main.model");
const {
  Province,
  Regency,
  District,
  Village,
} = require("../../common/models/region.model");

exports.createNew = async (req, res) => {
  // find region as district id;
  const region = await District.findOne({ where: { id: req.body.region_id } });
  if (region === null) {
    return res.status(404).send({ error: "Region (District Id) not found!" });
  }
  const postId = req.body.id;
  const newPost = {
    id: postId,
    name: req.body.name,
    type: req.body.type,
  };
  try {
    // set covererd to 1 every villages in that region.=================

    // get Province Id from Regency
    const regency = await Regency.findOne({ where: { id: region.RegencyId } });

    // set every covered to 1
    Province.update({ covered: 1 }, { where: { id: regency.ProvinceId } });
    Regency.update({ covered: 1 }, { where: { id: regency.id } });
    District.update({ covered: 1 }, { where: { id: region.id } });
    Village.update({ covered: 1 }, { where: { DistrictId: region.id } });
    // end set =========================================================

    const post = await Post.create(newPost);
    post.setRegion(region);

    res.send({
      post: { ...post.dataValues },
      region: { ...region.dataValues },
    });
  } catch (err) {
    res.status(500).send({ errors: err });
  }
};

exports.findAllPosts = (req, res) => {
  Post.findAll({
    include: {
      model: District,
      as: "region",
      attributes: ["name"],
      include: {
        model: Regency,
        attributes: ["name"],
        include: {
          model: Province,
          attributes: ["name"],
        },
      },
    },
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.deletePost = (req, res) => {
  Post.destroy({ where: { id: req.params.postId } })
    .then(() => res.send())
    .catch((err) => res.status(500).send(err));
};
