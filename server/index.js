const express = require("express");
const http = require("http");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/auth", { useNewUrlParser: true })
  .then(() => console.log("Connected to Mongodb database..."))
  .catch(err => console.log("Connection failed: ", err));

app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
require("./router")(app);

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log(`Listening on port ${port}...`);
