const { Post } = require("../../common/models/main.model");

exports.createNew = async (req, res) => {
  const postId = req.body.id;
  const newPost = {
    id: postId,
    name: req.body.name,
    regionId: req.body.region_id,
    type: req.body.type,
  };
  Post.create(newPost)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
