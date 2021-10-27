const { Op } = require("sequelize");
const EmailModel = require("../models/email.model");
const UserModel = require("../models/user.model");

exports.userEmailVerification = (req, res) => {
  EmailModel.findOne({
    where: {
      userId: req.params.userId,
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
            EmailModel.destroy({ where: { userId: data.userId } });
            res.send({ message: "Your email was activated!" });
          })
          .catch((err) => res.status(500).send());
      }
    })
    .catch((err) => res.status(500).send(err));
};

async function accountIsActive(userId) {
  let data = await UserModel.findOne({
    where: { id: userId },
    attributes: ["active", "email"],
  });
  return data;
}

exports.requestNewVerification = (req, res) => {
  if (!req.body.id) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }
  accountIsActive(req.body.id).then((data) => {
    if (data === null) {
      return res.status(400).send({ message: "User not registered" });
    }
    if (data.active) {
      return res
        .status(400)
        .send({ message: "Your account is already active" });
    }
    req.body.email = data.email;
    EmailModel.generateKey(128)
      .then((key) => {
        let expired = new Date();
        expired.setDate(expired.getDate() + 1);// set expired date for reset password key that active for a day
        EmailModel.upsert(
          {
            userId: req.body.id,
            email: req.body.email,
            activeKey: key,
            expiredDate: expired,
            enum: 1,
          },
          {
            where: {
              userId: req.body.id,
              enum: 1,
            },
          }
        )
          .then(() => {
            let host = req.protocol + "://" + req.get("host");
            let subject = "Email verification";
            let contentTxt = host + "/emails/verify/" + req.body.id + "?verification_token=" + key;
            let contentHtml =
              host + "/emails/verify/" + req.body.id + "?verification_token=" + key;
            EmailModel.sendMail(
              req.body.email,
              subject,
              contentTxt,
              contentHtml
            );
            res.send({
              message: "New confirmation e-mail has sent to " + req.body.email,
            });
          })
          .catch((err) => res.status(500).send(err));
      })
      .catch((err) => res.status(500).send(err));
  });
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
      EmailModel.generateKey(128).then((key) => {
        let expired = new Date();
        expired.setHours(expired.getHours() + 1); // set expired date for reset password key that active for an hour
        EmailModel.upsert(
          {
            userId: data.id,
            email: req.body.email,
            activeKey: key,
            expiredDate: expired,
            enum: 2,
          },
          {
            where: {
              userId: data.id,
              enum: 2,
            },
          }
        )
          .then(() => {
            let host = req.protocol + "://" + req.get("host");
            let subject = "Password Reset Confirmation";
            let contentTxt = host + "/password/reset/" + data.id + "?reset_token=" + key;
            let contentHtml = host + "/password/reset/" + data.id + "?reset_token=" + key;
            EmailModel.sendMail(
              req.body.email,
              subject,
              contentTxt,
              contentHtml
            );
            res.send({
              message:
                "Password reset confirmation has sent to " + req.body.email,
            });
          })
          .catch((err) => res.status(500).send(err));
      });
    })
    .catch((err) => res.status(500).send(err));
};
