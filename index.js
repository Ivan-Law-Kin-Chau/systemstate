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

app.get("/classes/Editor.js", function (req, res) {
	res.sendFile(__dirname + "/views/classes/Editor.js");
});

var database = new (require("sqlite3").verbose()).Database("./database/systemstate.db");
var commands = new (require("./packaging.js"))(database);

app.post("/", urlencodedParser, async function (req, res) {
	var command = req.body.command;
	var output = await commands.execute(decodeURIComponent(command));
	res.send(output);
});

app.listen(800);