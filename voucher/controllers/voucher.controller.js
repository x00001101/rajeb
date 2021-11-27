const { Op } = require("sequelize");
const { User, Voucher, Pouch } = require("../../common/models/main.model");

let output = {};

exports.createNewVoucher = (req, res) => {
  const newVoucher = {
    id: req.body.id,
    name: req.body.name,
    type: req.body.type,
    value: req.body.value,
    maxValue: req.body.maxValue,
    expiredDate: new Date(req.body.expiredDate),
    description: req.body.description,
    total: req.body.total,
    limit: req.body.limit,
  };
  Voucher.create(newVoucher)
    .then(() => {
      output.success = true;
      output.message = "Voucher created!";
      res.status(201).send(output);
    })
    .catch((err) => res.status(500).send(err));
};

exports.addToPouch = async (req, res) => {
  const voucherAvailability = await Voucher.findOne({
    where: {
      id: req.params.voucherId,
      expiredDate: {
        [Op.gt]: new Date(),
      },
    },
  });
  if (voucherAvailability === null) {
    output.success = false;
    output.message = "Voucher not found or expired!";
    return res.status(404).send(output);
  }
  const user = await User.findOne({
    where: {
      id: req.params.userId,
    },
  });
  if (user === null) {
    output.success = false;
    output.message = "User not found!";
    return res.status(404).send(output);
  }
  let totalVouchers = voucherAvailability.total;
  if (totalVouchers == 0) {
    output.success = false;
    output.message = "Voucher are not available";
    return res.status(400).send(output);
  }
  const voucherCount = await Pouch.findAll({
    where: { userId: req.params.userId, voucherId: req.params.voucherId },
  });
  if (
    voucherCount.length >= voucherAvailability.limit &&
    voucherAvailability.limit > 0
  ) {
    output.success = false;
    output.message = "User already has the maximum voucher limit";
    return res.status(400).send(output);
  }
  try {
    const voucher = await Voucher.findOne({
      where: { id: req.params.voucherId },
    });
    const pouch = await Pouch.create();
    pouch.setVoucher(voucher);
    pouch.setUser(user);
    if (totalVouchers != "-1") {
      totalVouchers = Number(totalVouchers) - 1;
      Voucher.update(
        { total: totalVouchers },
        { where: { id: req.params.voucherId } }
      );
    }
    output.success = true;
    output.message = `${req.params.voucherId} has been added to ${user.id}`;
    res.send(output);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.voucherDetail = (req, res) => {
  if (!req.params) {
    output.success = false;
    output.message = "Need parameters!";
    return res.status(404).send(output);
  }
  Voucher.findOne({ where: { id: req.params.voucherId } })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.allVouchers = (req, res) => {
  Voucher.findAll()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
