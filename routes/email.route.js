const EmailController = require('../controllers/email.controller');
const PermissionMiddleware = require('../middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../middlewares/auth.validation.middleware');

exports.routesConfig = (app) => {
  //user email verification
  app.get('/emails/verify/:userId/:activationKey', [
    EmailController.userEmailVerification
  ]);

  //request new email verification
  app.post('/emails/requestNewVerification', [
    ValidationMiddleware.validJWTNeeded,
    EmailController.requestNewVerification
  ])
};