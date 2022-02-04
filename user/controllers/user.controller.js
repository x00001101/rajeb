const { Op } = require("sequelize");
const models = require("../../common/models/main.model");
const UserModel = models.User;
const KeyModel = models.Key;
const Wallet = models.Wallet;
const Envelope = models.Envelope;
const crypto = require("crypto");
const CourierTransaction = models.CourierTransaction;
const AdminTransaction = models.AdminTransaction;
const MessageBox = models.MessageBox;
const jwtSecret = process.env.JWT_SECRET,
  jwt = require("jsonwebtoken");
const EmailModel = require("../../email/models/email.model");

const COURIER = process.env.COURIER;

const generateOtp = () => {
  let len = 6;
  let result = "";
  let characters = "0123456789";
  let charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const generateKey = async (len) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  let newKey = result;
  let data = await KeyModel.findOne({ where: { activeKey: newKey } });
  return data === null ? newKey : generateKey(len);
};

const createNewUser = async (host, newUser, result) => {
  let newKey = await generateKey(128);
  let expired = new Date();
  expired.setDate(expired.getDate() + 1);

  try {
    const UserData = await UserModel.create(newUser);
    const wallet = await Wallet.create({ balance: 0 });

    wallet.setUser(UserData);

    if (newUser.permissionLevel > COURIER) {
      const envelope = await Envelope.create({ balance: 0 });
      envelope.setUser(UserData);
    }

    const key = {
      otp: null,
      activeKey: newKey,
      expiredDate: expired,
      enum: 1,
    };

    const KeyData = await KeyModel.create(key);

    KeyData.setUser(UserData);

    const fields = {
      email: newUser.email,
      type: "EMAIL_VERIFICATION",
      url: host + "/emails/verify?verification_token=" + newKey,
      key: newKey,
    };

    EmailModel.sendEmail(fields);

    result(null, UserData);
  } catch (err) {
    result(err, null);
  }
};

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
  // req.body.permissionLevel = 1;
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
  createNewUser(host, user, (err, data) => {
    let output = {};
    if (err) {
      if (err.name == "SequelizeUniqueConstraintError") {
        output.success = false;
        output.output = null;
        if (err.errors[0].value === user.email) {
          output.message = "Registered e-mail!";
        } else if (err.errors[0].value === user.phoneNumber) {
          output.message = "Registered phone number!";
        }
        res.status(400).send(output);
      } else {
        res.status(500).send(err);
      }
    } else {
      try {
        // login
        req.body = {
          userId: data.id,
          email: data.email,
          permission_level: data.permissionLevel,
          active: data.active,
          provider: "New Account",
          name: data.fullName,
          phone_number: data.phoneNumber,
        };
        let refreshId = data.id + jwtSecret;
        let salt = crypto.randomBytes(16).toString("base64");
        let hash = crypto
          .createHmac("sha512", salt)
          .update(refreshId)
          .digest("base64");
        let token = jwt.sign(req.body, jwtSecret);
        let b = Buffer.from(hash);
        let refresh_token = b.toString("base64");

        output.success = true;
        output.messages = [
          "New account created successfully!",
          "Activation e-mail has been sent!, check your inbox / spam folder",
        ];
        output.output = {
          id: data.id,
          accessToken: token,
          refreshToken: refresh_token,
        };
        res.send(output);
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  });
};

exports.updateDataUser = (req, res) => {
  UserModel.update(
    {
      fullName: req.body.fullName,
      phoneNumber: req.body.phone_number,
      email: req.body.email,
    },
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
    include: ["User"],
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
      { where: { id: data.User.id } }
    );
    // destroy key
    KeyModel.destroy({ where: { id: data.id, enum: 2 } });
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
      res.status(500).send(err);
    });
};

exports.getDataFromJWT = (req, res) => {
  const UserData = {
    id: req.jwt.userId,
    email: req.jwt.email,
    permissionLevel: req.jwt.permission_level,
    active: req.jwt.active,
    name: req.jwt.name,
    phoneNumber: req.jwt.phone_number,
  };
  res.send(UserData);
};

exports.depositeEnvelope = async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).send({ success: false, error: "Need User Id!" });
  }
  const user = await UserModel.findOne({ where: { id: req.params.userId } });
  const userAdmin = await UserModel.findOne({ where: { id: req.jwt.userId } });
  const type = req.body.type;
  const envelope = await Envelope.findOne({
    where: { UserId: req.params.userId },
  });
  if (envelope === null) {
    return res
      .status(404)
      .send({ success: false, error: "Envelope not found!" });
  }
  let transactionType = "";
  if (type == "IN") {
    await Envelope.increment(
      { balance: Number(req.body.amount) },
      { where: { id: envelope.id } }
    );
    transactionType = "D_I";
  } else if (type == "OUT") {
    const balance = envelope.balance;
    // count available balance
    const lastBalance = Number(balance) - Number(req.body.amount);
    if (Number(lastBalance) < 0) {
      return res
        .status(400)
        .send({ success: false, error: "Insufisient balance!" });
    }
    await Envelope.increment(
      { balance: Number(req.body.amount) * -1 },
      { where: { id: envelope.id } }
    );
    transactionType = "D_O";
  }
  try {
    const courierTransaction = await CourierTransaction.create({
      amount: req.body.amount,
      mutation: type,
      type: transactionType,
      transaction: "E",
    });
    courierTransaction.setUser(user);

    const adminTransaction = await AdminTransaction.create();
    adminTransaction.setUser(userAdmin);
    adminTransaction.setCourierTransaction(courierTransaction);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  res.send();
};

exports.walletWithdrawal = async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).send({ success: false, error: "Need User Id!" });
  }
  const wallet = await Wallet.findOne({
    where: { UserId: req.params.userId },
  });
  if (wallet === null) {
    return res.status(404).send({ success: false, error: "Wallet not found!" });
  }
  const user = await UserModel.findOne({ where: { id: req.params.userId } });
  const userAdmin = await UserModel.findOne({ where: { id: req.jwt.userId } });
  const amount = req.body.amount;
  const balance = wallet.balance;
  const lastBalance = Number(balance) - Number(amount);
  if (Number(lastBalance) < 0) {
    return res
      .status(400)
      .send({ success: false, error: "Insufisient balance!" });
  }
  await Wallet.increment(
    { balance: Number(amount) * -1 },
    { where: { id: wallet.id } }
  );
  try {
    const courierTransaction = await CourierTransaction.create({
      amount: amount,
      mutation: "OUT",
      type: "W_W",
      transaction: "W",
    });
    courierTransaction.setUser(user);

    const adminTransaction = await AdminTransaction.create();
    adminTransaction.setUser(userAdmin);
    adminTransaction.setCourierTransaction(courierTransaction);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  res.send();
};

exports.getMessages = (req, res) => {
  let read = {};
  var rd = req.query.rd || "all";
  if (rd === "true") {
    read.read = true;
  } else if (rd === "false") {
    read.read = false;
  }
  MessageBox.findAll({ where: { UserId: req.params.userId, ...read } })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};

exports.setMessageToRead = (req, res) => {
  MessageBox.update(
    { read: true },
    { where: { UserId: req.params.userId, id: req.params.messageId } }
  )
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send(err));
};
