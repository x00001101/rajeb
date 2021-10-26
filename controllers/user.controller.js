const { Op } = require("sequelize");
const UserModel = require("../models/user.model");
const EmailModel = require("../models/email.model");
const crypto = require("crypto");

exports.createUser = (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Content can not be empty!",
    });
  }

  let salt = crypto.randomBytes(16).toString("base64");
  let hash = crypto
    .createHmac("sha512", salt)
    .update(req.body.password)
    .digest("base64");
  req.body.password = salt + "$" + hash;
  req.body.permissionLevel = 1;
  req.body.active = 0;

  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    permissionLevel: req.body.permissionLevel,
    active: req.body.active,
  };

  let host = req.protocol + "://" + req.get("host");
  UserModel.createNew(host, user, (err, data) => {
    if (err) {
      if (
        err.name == "SequelizeUniqueConstraintError" &&
        err.fields.users_email === user.email
      ) {
        res.status(400).send({ message: "Email already registered!" });
      } else {
        res.status(500).send({ error: err });
      }
    } else {
      res.send(data);
    }
  });
};

exports.updateDataUser = (req, res) => {
  UserModel.update(
    { firstName: req.body.firstName, lastName: req.body.lastName },
    { where: { id: req.params.userId } }
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send();
    });
};

exports.deleteUserById = (req, res) => {
  UserModel.destroy({ where: { id: req.params.userId } })
    .then(() => res.status(204).end())
    .catch((err) => res.status(500).send(err));
};

const ATTRIBUTES = ["id", "firstName", "lastName", "email"];

exports.findAllUsers = (req, res) => {
  UserModel.findAll({ attributes: ATTRIBUTES })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};

exports.findUserById = (req, res) => {
  UserModel.findOne({
    where: { id: req.params.userId },
    attributes: ATTRIBUTES,
  })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send());
};

exports.resetPasswordConfirmation = (req, res) => {
  res.send({
    id: req.params.userId,
    reset_password_key: req.params.activationKey,
  });
};

exports.resetPasswordForm = (req, res) => {
  // do reset
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send({ error: "Content can not be empty!" });
  }
  if (req.body.new_password === "") {
    return res.status(400).send({ error: "New Password can not be empty" });
  }
  // check if reset_password_key is active
  EmailModel.findOne({
    where: {
      userId: req.params.userId,
      activeKey: req.body.reset_password_key,
      enum: 2, // 2 means password reset
      expiredDate: {
        [Op.gt]: new Date(),
      },
    },
  }).then((data) => {
    if (data === null) {
      return res.status(404).send({
        message: "Your reset password request is either expired or unavailable",
      });
    }
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(req.body.new_password)
      .digest("base64");
    req.body.new_password = salt + "$" + hash;
    // update password
    UserModel.update(
      { password: req.body.new_password },
      { where: { id: req.params.userId } }
    );
    // destroy key
    EmailModel.destroy({ where: { userId: req.params.userId, enum: 2 } });
    res.send({ message: "Password has been changed, try login" });
  });
};

exports.changePassword = (req, res) => {
  // change password
};
