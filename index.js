var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

app.use("/", express.static(__dirname + "/views/"))

var database = new (require("sqlite3").verbose()).Database("./database/systemstate.db");
var commands = new (require("./assembly.js"))(database);

app.post("/terminal", urlencodedParser, async function (req, res) {
	var command = req.body.command;
	var output = await commands.execute(decodeURIComponent(command));
	res.send(output);
});

app.listen(800);