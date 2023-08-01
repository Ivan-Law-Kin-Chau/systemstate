var express = require("express");
var app = express();

app.use("/", express.static(__dirname + "/views/dist/"));

app.listen(80);