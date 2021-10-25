const jwt = require('jsonwebtoken'),
  secret = process.env.JWT_SECRET;
const ADMIN_PERMISSION = process.env.ADMIN;

exports.minimumPermissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    let user_permission_level = parseInt(req.jwt.permission_level);
    let userId = req.jwt.userId;
    if (user_permission_level & required_permission_level) {
      return next();
    } else {
      return res.status(403).send();
    }
  };
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  let user_permission_level = parseInt(req.jwt.permission_level);
  let userId = req.jwt.userId;
  if (req.params && req.params.userId && userId === req.params.userId) {
    return next();
  } else {
    if (user_permission_level & ADMIN_PERMISSION) {
      return next();
    } else {
      return res.status(403).send();
    }
  }
};

exports.sameUserCantDoThisAction = (res, req, next) => {
  let userId = req.jwt.userId;
  if (req.params.userId !== userId) {
    return next();
  } else {
    return res.status(403).send();
  }
};

exports.onlyActiveUserCanDoThisAction = (res, req, next) => {
  let active = req.jwt.active;
  if (active) {
    return next();
  } else {
    return res.status(403).send({message: 'You need to activate your account'});
  }
};