const { Post } = require("../../common/models/main.model");
const { District } = require("../../common/models/region.model");

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
    const post = await Post.create(newPost);
    post.setRegion(region);
    res.send({
      post: { ...post.dataValues },
      region: { ...region.dataValues },
    });
  } catch (err) {
    res.status(500).send();
  }
};

exports.findAllPosts = (req, res) => {
  Post.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
