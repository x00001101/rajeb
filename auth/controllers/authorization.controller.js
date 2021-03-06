const jwtSecret = process.env.JWT_SECRET,
  jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Room } = require("../../common/models/main.model");

exports.login = (req, res) => {
  try {
    let refreshId = req.body.userId + jwtSecret;
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");
    req.body.refreshKey = salt;
    let token = jwt.sign(req.body, jwtSecret);
    let b = Buffer.from(hash);
    let refresh_token = b.toString("base64");
    res.status(201).send({
      id: req.body.userId,
      accessToken: token,
      refreshToken: refresh_token,
    });
  } catch (err) {
    res.status(500).send({ errors: err });
  }
};

exports.refresh_token = (req, res) => {
  try {
    req.body = req.jwt;
    let token = jwt.sign(req.body, jwtSecret);
    res.status(201).send({ id: token });
  } catch (err) {
    res.status(500).send({ errors: err });
  }
};

exports.registerDevId = async (req, res) => {
  try {
    const devId = req.body.deviceId;
    if (devId.length > 255) {
      return res.status(400).send({ success: false, error: "id length > 255" });
    }
    const findId = await Room.findOne({ where: { id: devId } });
    if (findId === null) {
      await Room.create({ id: devId, UserId: req.jwt.userId });
      return res.send({ success: true });
    } else {
      return res.send({ success: true, message: "Registered ID" });
    }
  } catch (err) {
    res.status(500).send({ errors: err });
  }
};
