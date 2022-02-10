const { admin } = require("../../firebase-config");
const { Room } = require("../models/main.model");

exports.pushNotification = async (req, res) => {
  const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };

  const userId = req.body.userId;
  // get token
  const room = await Room.findAll({ where: { UserId: userId }});
  let out = [];
  for ( var i = 0; i < room.length; i++) {
    const options = notification_options;
    const registrationToken = room[i]["id"];
    const message = {
      notification: {
        title: req.body.title,
        body: req.body.message
      }
    };
    const send = await admin.messaging().sendToDevice(registrationToken, message, options);
    out.push(send);
  }
  res.send(out);
}