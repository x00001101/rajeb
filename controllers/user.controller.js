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

  let host = req.protocol + '://' + req.get('host');
  UserModel.createNew(host, user, (err, data) => {
    if (err) {
      if (err.name == "SequelizeUniqueConstraintError" && err.fields.users_email === user.email) {
        res.status(400).send({message: 'Email already registered!'});
      } else {
        res.status(500).send({error: err});
      }
    } else {
      res.send(data);
    }
  });
};

exports.updateDataUser = (req, res) => {
  UserModel.update({ firstName: req.body.firstName, lastName: req.body.lastName }, { where: { id: req.params.userId }})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send();
    })
};

exports.deleteUserById = (req, res) => {
  UserModel.destroy({ where: { id: req.params.userId }})
    .then(() => res.status(204).end())
    .catch(err => res.status(500).send(err));
};

const ATTRIBUTES = [ 'id', 'firstName', 'lastName', 'email' ];

exports.findAllUsers = (req, res) => {
  UserModel.findAll({ attributes: ATTRIBUTES})
    .then(data => res.send(data))
    .catch(err => res.status(500).send());
};

exports.findUserById = (req, res) => {
  UserModel.findOne({ where: { id: req.params.userId }, attributes: ATTRIBUTES})
    .then(data => res.send(data))
    .catch(err => res.status(500).send());
};