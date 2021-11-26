const { Op } = require("sequelize");
const EmailModel = require("../models/email.model");
// const KeyModel = require("../../key/models/key.model");
// const UserModel = require("../../user/models/user.model");
const models = require("../../common/models/main.model"),
  KeyModel = models.Key,
  UserModel = models.User;

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

exports.userEmailVerification = async (req, res) => {
  const key = await KeyModel.findOne({
    where: {
      activeKey: req.query.verification_token,
      enum: 1, // 1 means email verification
      expiredDate: {
        [Op.gt]: new Date(),
      },
    },
    include: ["User"],
  });
  if (key === null) {
    return res.status(404).send({
      message: "Your activation key is either expired or unavailable",
    });
  }
  const user = await UserModel.update(
    { active: 1 },
    { where: { id: key.User.id } }
  );
  // delete key
  KeyModel.destroy({ where: { id: key.id } });
  res.send({ message: "Your email was activated!" });
};

exports.requestNewVerification = async (req, res) => {
  let newKey = await generateKey(128);
  const user = await UserModel.findOne({ where: { id: req.jwt.userId } });
  if (user === null) {
    return res.status(404).send({ message: "User not found!" });
  }
  const expired = new Date();
  expired.setDate(expired.getDate() + 1);
  const KeyData = {
    otp: null,
    activeKey: newKey,
    expiredDate: expired,
    enum: 1,
  };
  const previous_key = await KeyModel.findOne({
    where: { userId: req.jwt.userId, enum: 1 },
  });
  if (previous_key) {
    KeyModel.destroy({ where: { id: previous_key.id } });
  }
  try {
    const key = await KeyModel.create(KeyData);
    key.setUser(user);
    const fields = {
      email: user.email,
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
    res.send(key);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.resetPasswordRequest = async (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return res.status(400).send();
  }
  let newKey = await generateKey(128);
  // find registered email
  const user = await UserModel.findOne({
    where: { email: req.body.email },
  });

  if (user === null) {
    return res.status(404).send({ message: "E-mail not registered!" });
  }
  const expired = new Date();
  expired.setDate(expired.getDate() + 1);
  const KeyData = {
    otp: null,
    activeKey: newKey,
    expiredDate: expired,
    enum: 2,
  };
  const previous_key = await KeyModel.findOne({
    where: { userId: req.jwt.userId, enum: 2 },
  });
  if (previous_key) {
    KeyModel.destroy({ where: { id: previous_key.id } });
  }
  try {
    const key = await KeyModel.create(KeyData);
    key.setUser(user);
    const fields = {
      email: user.email,
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
    res.send(key);
  } catch (err) {
    res.status(500).send(err);
  }
};
