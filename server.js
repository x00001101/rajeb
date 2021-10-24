require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const UserRoutes = require('./routes/user.route');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

UserRoutes.routesConfig(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("App is listening at port " + PORT);
});