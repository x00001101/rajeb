const { Tracking, User } = require("../../common/models/main.model");
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

exports.setPostCourier = (req, res) => {
  
}