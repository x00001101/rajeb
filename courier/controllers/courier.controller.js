const {
  Tracking,
  User,
  CourierPost,
  OrderList,
} = require("../../common/models/main.model");
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
  let offlim = {};
  if (req.query.off) {
    offlim.offset = Number(req.query.off);
  }
  if (req.query.lim) {
    offlim.limit = Number(req.query.lim);
  }
  Tracking.findAll({ ...offlim, where: { UserId: req.jwt.userId } })
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
    where: { permissionLevel: "15", ...param },
    ...offlim,
    attributes: ATTRIBUTES,
    include: CourierPost,
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};

exports.setPostCourier = async (req, res, next) => {
  const courierId = req.params.userId;

  const courier = await User.findOne({ where: { id: courierId } });
  if (courier === null) {
    return res.status(404).send({ error: "User is not found!" });
  }

  const pst = req.body.posts;
  
  const villages = pst.split(";");

  let posts = {};

  for (i in villages) {
    const village = await Village.findOne({ where: { id: villages[i] } });
    if (village === null) {
      return res.status(400).send({
        posts_index: i,
        error: "Village id not found: " + villages[i],
      });
      break;
    }
    posts[i] = village;
  }

  try {
    for (post in posts) {
      const village = posts[post];
      // find if user is already assigned in village
      const courierAssigned = await CourierPost.findOne({
        where: { UserId: courier.id, VillageId: village.id },
      });
      if (courierAssigned === null) {
        const courierPosts = await CourierPost.create();
        courierPosts.setUser(courier);
        courierPosts.setVillage(village);
      }
    }
  } catch (err) {
    next(err);
  }

  res.send({ courierId: courier.id, ...posts });
};

exports.getOrderList = (req, res) => {
  let accepted = {};
  var acc = req.query.acc || "all";
  if (acc === "true") {
    accepted.accepted = true;
  } else if (acc === "false") {
    accepted.accepted = false;
  }
  let off_lim = {}; // set offset limit
  if (req.query.off) {
    off_lim.offset = Number(req.query.off);
  }
  if (req.query.lim) {
    off_lim.limit = Number(req.query.lim);
  }

  OrderList.findAll({
    ...off_lim,
    order: [["createdAt", "DESC"]],
    where: { assignedUserId: req.params.userId, ...accepted },
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.acceptOrderList = (req, res) => {
  const accept = req.body.accept;
  OrderList.update(
    { accepted: accept, acceptedUserId: req.params.userId },
    { where: { OrderId: req.params.orderId } }
  )
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.getCourierPost = (req, res) => {
  CourierPost.findAll({ 
    where: { 
      UserId: req.params.userId 
    },
    include: [
      { model: Village },
      { 
        model: User,
        attributes: [ "id", "fullName", "phoneNumber", "email" ]
      }
    ]
  })
    .then(data => res.send(data))
    .catch(err => res.status(500).send(err));
}
