const UserModel = require('../models/user.model');
const crypto = require('crypto');

exports.createUser = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Content can not be empty!'
    });
  }

  let salt = crypto.randomBytes(16).toString('base64');
  let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest('base64');
  req.body.password = salt + '$' + hash;
  req.body.permissionLevel = 1;
  req.body.active = 0;

  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    permissionLevel: req.body.permissionLevel,
    active: req.body.active
  };

  UserModel.createNew(user, (err, data) => {
    if (err) {
      res.status(500).send({error: err.message});
    } else {
      res.send(data);
    }
  });
};