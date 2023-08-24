const esbuild = require("esbuild");
const PEG = require("pegjs");
const fs = require("fs");

esbuild.transform(PEG.generate(fs.readFileSync("src/parse.pegjs", {
	encoding: "utf8"
}), {
	cache: true, 
	output: "source", 
	format: "umd"
}), {
	globalName: "window.parser", 
	format: "iife"
}).then(parser => {
	fs.writeFileSync("dist/parse.js", parser.code);
	
	esbuild.transform(PEG.generate(fs.readFileSync("src/tokenize.pegjs", {
		encoding: "utf8"
	}), {
		cache: true, 
		output: "source", 
		format: "umd"
	}), {
		globalName: "window.tokenizer", 
		format: "iife"
	}).then(tokenizer => {
		fs.writeFileSync("dist/tokenize.js", tokenizer.code);
		
		esbuild.build({
			entryPoints: ["src/index.jsx"], 
			mainFields: ["browser", "module", "main"], 
			bundle: true, 
			outfile: "dist/bundle.js", 
			logLevel: "info"
		}).catch(() => process.exit(1));
	});
});