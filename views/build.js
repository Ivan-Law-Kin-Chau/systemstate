var esbuild = require("esbuild");

esbuild.build({
	entryPoints: ["src/index.jsx"], 
	mainFields: ["browser", "module", "main"], 
	bundle: true, 
	outfile: "dist/bundle.js", 
	logLevel: "info"
}).catch(() => process.exit(1));