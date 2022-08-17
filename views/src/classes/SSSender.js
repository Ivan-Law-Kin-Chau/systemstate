export default class SSSender {
	constructor () {
		this.script = [];
		this.cache = {};
	}
	
	clearCache () {
		this.cache = {};
	}
	
	push (functionName, functionParameters) {
		if (typeof functionName !== "string" || !(functionName.length > 0)) throw "Function name error";
		if (typeof functionParameters !== "string" || !(functionParameters.length > 0)) throw "Function parameters error";
		this.script.push([functionName, functionParameters]);
	}
	
	pushCallback (callback) {
		this.script.push(callback);
	}
	
	async execute () {
		for (let line in this.script) {
			if (Array.isArray(this.script[line]) === true) {
				await this.send(this.script[line][0], this.script[line][1]);
			} else if (typeof this.script[line] === "function") {
				this.script[line]();
			}
		}
		
		this.script = [];
		return true;
	}
	
	async send (functionName, functionParameters) {
		var command = functionName + functionParameters;
		if (this.cache[command]) {
			return this.cache[command];
		} else {
			console.log(command);
			return new Promise ((resolve, reject) => {
				const sender = this;
				var terminal = new XMLHttpRequest();
				terminal.onreadystatechange = async function () {
					if (this.readyState == 4 && this.status == 200) {
						const response = JSON.parse(this.responseText);
						if (functionName === "search") sender.cache[command] = response;
						resolve(response);
					}
				}
				terminal.open("POST", "http://localhost:800/terminal", true);
				terminal.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				
				// encodeURIComponent does not turn percentage signs into "%25" correctly, so we have to do that manually
				command = command.split("%").join("%25");
				
				terminal.send("command=" + encodeURIComponent(command));
			});
		}
	}
}