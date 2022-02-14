const { Order, User } = require("../../common/models/main.model");

exports.customerPage = (socket) => {
  return (req, res) => {
    if (socket) {
      socket.emit("something", "this is new notification");
    }
    res.send({ message: "This is Customer page" });
  };
};

exports.customerOrderHistory = async (req, res) => {
  let offlim = {};
  if (!req.params.userId) {
    return res.status(403).send({ error: "Need User Id" });
  }
  const user = await User.findOne({ where: { id: req.params.userId } });
  if (user === null) {
    return res.status(404).send({ success: false, error: "User Not found!" });
  }
  if (req.query.off) {
    offlim.offset = Number(req.query.off);
  }
  if (req.query.lim) {
    offlim.limit = Number(req.query.lim);
  }
  Order.findAll({
    order: [["createdAt", "desc"]],
    where: { UserId: req.params.userId },
    ...offlim,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(500).send());
};
