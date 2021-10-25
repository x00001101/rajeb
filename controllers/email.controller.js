const { Op } = require('sequelize');
const EmailModel = require('../models/email.model');
const UserModel = require('../models/user.model');

exports.userEmailVerification = (req, res) => {
  EmailModel.findOne({ 
    where: {
     userId: req.params.userId, 
     activeKey: req.params.activationKey,
     enum: 1, // 1 means email verification
     expiredDate: {
      [Op.gt]: new Date() 
     }
    }
  }).then(data => {
    if (data === null) {
      res.status(404).send({message: 'Your activation key is either expired or unavailable'});
    } else {
      UserModel.update({ active: 1 }, { where: { id: data.userId }})
        .then(() => {
          EmailModel.destroy({ where: { userId: data.userId } });
          res.send({message: 'Your email was activated!'})
        })
        .catch(err => res.status(500).send());
    }
  }).catch(err => res.status(500).send(err));
};

exports.requestNewVerification = (req, res) => {
  req.body.id = req.jwt.userId;
  req.body.email = req.jwt.email;
  EmailModel.generateKey(128)
    .then(key => {
      let expired = new Date();
      expired.setDate(expired.getDate() + 1);
      EmailModel.upsert({ 
        userId: req.body.id, 
        email: req.body.email, 
        activeKey: key, 
        expiredDate: expired, 
        enum: 1 
      }, { 
        where: { 
          userId: req.body.id, enum: 1 
        }
      })
      .then(data => {
        console.log(data);
        let host = req.protocol + '://' + req.get('host');
        let subject = 'Email verification';
        let contentTxt = host + '/emails/verify/' + req.body.id + '/' + key;
        let contentHtml = host + '/emails/verify/' + req.body.id + '/' + key;
        EmailModel.sendMail(req.body.email, subject, contentTxt, contentHtml);
        res.send({message: 'New confirmation e-mail has sent to ' + req.body.email});
      })
      .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
};