const { Tracking, User, CourierPost } = require("../../common/models/main.model");
const { Village } = require("../../common/models/region.model");
const { Op } = require("sequelize");

exports.courierPage = (socket) => {
  return (req, res) => {
    if (socket) {
      socket.emit("hello", "world");
    }
    res.send({ message: "This is Courier page" });
  };
};

exports.courierHistory = (req, res) => {
  Tracking.findAll({ where: { UserId: req.jwt.userId } })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};

exports.getAllCourierData = (req, res) => {
  let offlim = {};
  if (req.query.off) {
    offlim.offset = Number(req.query.off);
  }
  if (req.query.lim) {
    offlim.limit = Number(req.query.lim);
  }
  let param = {};
  if (req.query.src) {
    param.email = { [Op.like]: "%" + req.query.src + "%" };
  }

  const ATTRIBUTES = ["id", "fullName", "phoneNumber", "email"];
  User.findAll({
    where: { permissionLevel: "5", ...param },
    ...offlim,
    attributes: ATTRIBUTES,
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};

exports.setPostCourier = async (req, res, next) => {
  const courierId = req.params.userId;

  const courier = await User.findOne({ where: { id: courierId }});
  if (courier === null) {
    return res.status(404).send({ error: "User is not found!"});
  }

  const villages = req.body.posts;
  const array = Array.isArray(villages);
  if (!array) {
    return res.status(400).send({ error: "Posts must be an array!"});
  }

  let posts = {};
  
  for (i in villages){
    const village = await Village.findOne({ where: { id: villages[i] }});
    if (village === null) {
      return res.status(400).send({ posts_index: i, error: "Village id not found: " + villages[i]});
      break;
    }
    posts[i] = village;
  }

  try {
    for (post in posts) {
      const village = posts[post];
      // find if user is already assigned in village
      const courierAssigned = await CourierPost.findOne({ where: { UserId: courier.id, VillageId: village.id }});
      if (courierAssigned === null) {        
        const courierPosts = await CourierPost.create();
        courierPosts.setUser(courier);
        courierPosts.setVillage(village);
      }
    }
  } catch (err) {
    next(err);
  }

  res.send({courierId: courier.id, ...posts});
}