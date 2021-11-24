const ADMIN_PERMISSION = process.env.ADMIN,
  SUPER_USER_PERMISSION = process.env.SUPER_USER;

exports.minimumPermissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    let user_permission_level = parseInt(req.jwt.permission_level);
    if (user_permission_level & required_permission_level) {
      return next();
    } else {
      return res.status(403).send();
    }
  };
};

/*
 * Permited permission level is addition of the order according to the hierarchy
 *
 * permited_permission_level as GUEST => GUEST
 * permited_permission_level as CUSTOMER => GUEST + CUSTOMER
 * permited_permission_level as COURIER => GUEST + CUSTOMER + COURIER
 */
exports.onlyAdminAndPermitedPermissionLevelRequired = (
  permited_permission_level
) => {
  return (req, res, next) => {
    let user_permission_level = parseInt(req.jwt.permission_level);
    if (user_permission_level === permited_permission_level) {
      return next();
    } else {
      if (user_permission_level & ADMIN_PERMISSION || user_permission_level & SUPER_USER_PERMISSION) {
        return next();
      } else {
        return res.status(403).send({ error: "You are not permited" });
      }
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

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;
  if (req.params.userId !== userId) {
    return next();
  } else {
    return res.status(403).send();
  }
};

exports.onlyActiveUserCanDoThisAction = (req, res, next) => {
  let active = req.jwt.active;
  if (active) {
    return next();
  } else {
    return res
      .status(403)
      .send({ message: "You need to activate your account" });
  }
};

exports.onlyInactiveUserCanDoThisAction = (req, res, next) => {
  let active = req.jwt.active;
  if (!active) {
    return next();
  } else {
    return res.status(403).send({ message: "Your account is already active" });
  }
};

exports.toCreateAnAdminNeedAdminOrSuperUser = (req, res, next) => {
  if (parseInt(req.body.permissionLevel) < 2048) {
    return next();
  }
  if (!req.headers["authorization"]) {
    return res.status(403).send();
  }
  let user_permission_level = parseInt(req.jwt.permission_level);
  if (user_permission_level & SUPER_USER_PERMISSION) {
    return next();
  } else {
    return res.status(403).send();
  }
};
