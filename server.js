require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { User, Room } = require("./common/models/main.model");

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
const PackingRoutes = require("./packing/routes");

// get server IP
const { networkInterfaces } = require("os");

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === "IPv4" && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  // console.log("App is listening at http://" + results["eth0"][0] + ":" + PORT);
  console.log("App is listening at http://localhost:" + PORT);
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
  socket.on("createConnection", async (userId) => {
    // save this userId to database
    const user = await User.findOne({ where: { id: userId }});
    try {
      const room = await Room.create({ id: socket.id });
      room.setUser(user);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("disconnect", () => {
    Room.destroy({ where: { id: socket.id }});
  })
  socketServer = socket;
});

AuthRoutes.routesConfig(app);
UserRoutes.routesConfig(app);
EmailRoutes.routesConfig(app);
CourierRoutes.routesConfig(app, socketServer);
CustomerRoutes.routesConfig(app, socketServer);
OrderRoutes.routesConfig(app, socketServer, io);
CommonRoutes.routesConfig(app);
PostRoutes.routesConfig(app);
ServiceRoutes.routesConfig(app);
VoucherRoutes.routesConfig(app);
PackingRoutes.routesConfig(app);
