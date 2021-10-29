const { Op } = require("sequelize");
const EmailModel = require("../models/email.model");
const KeyModel = require("../models/key.model");
const UserModel = require("../models/user.model");

exports.userEmailVerification = (req, res) => {
  KeyModel.findOne({
    where: {
      activeKey: req.query.verification_token,
      enum: 1, // 1 means email verification
      expiredDate: {
        [Op.gt]: new Date(),
      },
    },
  })
    .then((data) => {
      if (data === null) {
        res.status(404).send({
          message: "Your activation key is either expired or unavailable",
        });
      } else {
        UserModel.update({ active: 1 }, { where: { id: data.userId } })
          .then(() => {
            KeyModel.destroy({ where: { userId: data.userId } });
            res.send({ message: "Your email was activated!" });
          })
          .catch((err) => res.status(500).send());
      }
    })
    .catch((err) => res.status(500).send(err));
};

exports.requestNewVerification = (req, res) => {
  if (!req.body.id) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }
  // if account is active
  UserModel.findOne({ where: { id: req.body.id }})
    .then(data => {
      if (data === null) {
        return res.status(404).send({ message: "User not found!"});
      }
      if (data.active) {
        return res.status(400).send({ error: "User is active!"});
      }
      // send here
    })
};

exports.resetPasswordRequest = (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send();
  }
  // find registered email
  UserModel.findOne({
    where: { email: req.body.email },
    attributes: ["id"],
  })
    .then((data) => {
      if (data === null) {
        return res.status(404).send({ message: "E-mail not registered!" });
      }
    })
    .catch((err) => res.status(500).send(err));
};
