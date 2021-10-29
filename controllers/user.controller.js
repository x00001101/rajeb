const { Op } = require("sequelize");
const UserModel = require("../models/user.model");
const KeyModel = require("../models/key.model");
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
    fullName: req.body.fullName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    password: req.body.password,
    permissionLevel: req.body.permissionLevel,
    active: req.body.active,
  };

  let host = req.protocol + "://" + req.get("host");
  UserModel.createNewUser(host, user, (err, data) => {
    if (err) {
      if (err.name == "SequelizeUniqueConstraintError") {
        if (err.errors[0].value === user.email) {
          res.status(400).send({ message: "E-mail already registered!" });
        } else if (err.errors[0].value === user.phoneNumber) {
          res.status(400).send({ message: "Phone Number already registered!" });
        }
      } else {
        res.status(500).send(err);
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

const ATTRIBUTES = ["id", "fullName", "phoneNumber", "email"];

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
  KeyModel.findOne({
    where: {
      activeKey: req.query.reset_token,
      enum: 2,
      expiredDate: {
        [Op.gt]: new Date(),
      },
    },
  }).then((data) => {
    if (data === null) {
      return res.status(404).send({
        message: "Reset password key has either expired or not available!",
      });
    } else {
      res.send({
        id: data.userId,
        reset_password_key: req.query.reset_token,
      });
    }
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
  KeyModel.findOne({
    where: {
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
      { where: { id: data.userId } }
    );
    // destroy key
    KeyModel.destroy({ where: { userId: data.userId, enum: 2 } });
    res.send({ message: "Password has been changed, try login" });
  });
};

exports.changePassword = (req, res) => {
  // change password
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Content can not be empty!",
    });
  }
  // is req.body.old_password and password match
  UserModel.findOne({
    where: { id: req.params.userId },
    attributes: ["password"],
  })
    .then((data) => {
      if (data === null) {
        return res.status(404).send({ message: "User not registered" });
      }
      let passwordField = data.password.split("$");
      let salt = passwordField[0];
      let hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.old_password)
        .digest("base64");
      if (hash == passwordField[1]) {
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
        res.send({ message: "Password has been changed" });
      } else {
        return res.status(400).send({ errors: ["Invalid old password"] });
      }
    })
    .catch((err) => {
      res.status(500).send();
    });
};
