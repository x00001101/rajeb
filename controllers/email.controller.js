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

exports.requestNewVerification = async (req, res) => {
  let newKey = await KeyModel.generateKey(128);
  // if account is active
  UserModel.findOne({ where: { id: req.jwt.userId } }).then((data) => {
    if (data === null) {
      return res.status(404).send({ message: "User not found!" });
    }
    if (data.active) {
      return res.status(400).send({ error: "User is active!" });
    }
    // send here
    const expired = new Date();
    expired.setDate(expired.getDate() + 1);
    const Key = {
      userId: req.jwt.userId,
      otp: null,
      activeKey: newKey,
      expiredDate: expired,
      enum: 1,
    };

    KeyModel.upsert(Key, { where: { userId: req.jwt.userId, enum: 1 } });

    const fields = {
      email: data.email,
      type: "EMAIL_VERIFICATION",
      url:
        req.protocol +
        "://" +
        req.get("host") +
        "/emails/verify?verification_token=" +
        newKey,
      key: newKey,
    };

    EmailModel.sendEmail(fields);

    res.send({ message: "New verification email was sent to " + data.email });
  });
};

exports.resetPasswordRequest = async (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send();
  }
  let newKey = await KeyModel.generateKey(128);
  // find registered email
  UserModel.findOne({
    where: { email: req.body.email },
    attributes: ["id"],
  })
    .then((data) => {
      if (data === null) {
        return res.status(404).send({ message: "E-mail not registered!" });
      }

      const expired = new Date();
      expired.setDate(expired.getDate() + 1);
      const Key = {
        userId: data.id,
        otp: null,
        activeKey: newKey,
        expiredDate: expired,
        enum: 2,
      };
      KeyModel.upsert(Key, { where: { userId: data.id, enum: 2 } });

      const fields = {
        email: req.body.email,
        type: "PASSWORD_RESET",
        url:
          req.protocol +
          "://" +
          req.get("host") +
          "/password/reset?reset_token=" +
          newKey,
        key: newKey,
      };

      EmailModel.sendEmail(fields);

      res.send({
        message:
          "New reset password confirmation request was sent to " +
          req.body.email,
      });
    })
    .catch((err) => res.status(500).send(err));
};
