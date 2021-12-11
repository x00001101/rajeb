const { Tracking } = require("../../common/models/main.model");

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
