require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const UserRoutes = require('./routes/user.route');
const AuthRoutes = require('./routes/auth.route');
const EmailRoutes = require('./routes/email.route');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  } else {
      return next();
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

AuthRoutes.routesConfig(app);
UserRoutes.routesConfig(app);
EmailRoutes.routesConfig(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("App is listening at port " + PORT);
});