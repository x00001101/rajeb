require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
const httpServer = createServer(app);

const UserRoutes = require("./user/routes");
const AuthRoutes = require("./auth/routes");
const EmailRoutes = require("./email/routes");
const CourierRoutes = require("./courier/routes");
const CustomerRoutes = require("./customer/routes");
const OrderRoutes = require("./order/routes");
const CommonRoutes = require("./common/routes");
const PostRoutes = require("./post/routes");
const ServiceRoutes = require("./service/routes");
const VoucherRoutes = require("./voucher/routes");

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log("App is listening at port " + PORT);
});

const io = new Server(httpServer, {
  path: "/socket.io",
  forceNew: true,
  reconnectionAttempts: 3,
  timeout: 2000,
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

let socketServer;

io.on("connection", (socket) => {
  console.log("Made socket connection with id: " + socket.id);
  socketServer = socket;
});

AuthRoutes.routesConfig(app);
UserRoutes.routesConfig(app);
EmailRoutes.routesConfig(app);
CourierRoutes.routesConfig(app, socketServer);
CustomerRoutes.routesConfig(app, socketServer);
OrderRoutes.routesConfig(app, socketServer);
CommonRoutes.routesConfig(app);
PostRoutes.routesConfig(app);
ServiceRoutes.routesConfig(app);
VoucherRoutes.routesConfig(app);
