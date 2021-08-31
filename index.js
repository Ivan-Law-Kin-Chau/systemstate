var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.get("/", function (req, res) {
	res.render("index.html");
});

var database = new (require("sqlite3").verbose()).Database("./database/systemstate.db");
var commands = new (require("./assembly.js"))(database);

app.post("/", urlencodedParser, async function (req, res) {
	var command = req.body.command;
	var output = await commands.execute(decodeURIComponent(command));
	res.send(output);
});

app.listen(800);