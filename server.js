const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (err, res) => {
  res.send({message: "hai"});
});

app.listen(3600, () => {
  console.log("Server is running at port 3600");
});