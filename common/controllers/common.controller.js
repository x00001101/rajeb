const { sendNotification } = require("../models/main.model");

exports.pushNotification = async (req, res) => {
  try {
    const out = await sendNotification(
      req.body.userId,
      req.body.title,
      req.body.message
    );
    res.send(out);
  } catch (err) {
    res.status(500).send();
  }
};
