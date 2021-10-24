const UserModel = require('../models/user.model');

exports.createUser = (req, res) => {
  const user = {
    id: 'askdjfaklsdjfwoeifj',
    firstName: 'masandy',
    lastName: 'hariyanto',
    email: 'x00001101@gmail.com',
    password: 'sdlskdajf',
    permissionLevel: 1
  };
  UserModel.createNew(user, (err, data) => {
    if (err) {
      res.status(500).send();
    } else {
      res.send(data);
    }
  });
};