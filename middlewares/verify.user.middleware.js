const UserModel = require('../models/user.model'),
  crypto = require('crypto');

exports.hasAuthValidFields = (req, res, next) => {
  let errors = [];

  if (req.body) {
    if (!req.body.email) {
      errors.push('Missing email field');
    }
    if (!req.body.password) {
      errors.push('Missing password field');
    }
    if (errors.length) {
      return res.status(400).send({errors: errors.join(',')});
    } else {
      return next();
    }
  } else {
    return res.status(400).send({
      errors: 'Missing email and password fields'
    });
  }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
  UserModel.findOne({ where: { email: req.body.email }})
    .then(data => {
      if (data === null) {
        return res.status(404).send({ message: 'e-mail is not registered'});
      } else {
        let passwordField = data.password.split('$');
        let salt = passwordField[0];
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest('base64');
        if (hash == passwordField[1]) {
          req.body = {
            userId: data.id,
            email: data.email,
            permission_level: data.permissionLevel,
            active: data.active,
            provider: 'email',
            name: data.firstName + ' ' + data.lastName
          };
          return next();
        } else {
          return res.status(400).send({errors: ['Invalid e-mail or password']});
        }
      }
    })
    .catch(err => {
      res.status(500).send();
    })
};