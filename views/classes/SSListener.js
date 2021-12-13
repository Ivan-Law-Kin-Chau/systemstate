export default class SSListener {
	constructor (assembly) {
		this.assembly = assembly;
	}
	
	// Called by the element classes in order to change the state in the SSAssembly class
	// TODO: Add the code to change the state in the SSAssembly class
	dispatch (action = {}) {
		if (action.type === "SELECT") {
			console.log("Select Element: " + action.key);
		} else if (action.type === "OPEN") {
			console.log("Open Key: " + action.key);
		} else if (action.type === "SAVE") {
			console.log({
				"id": action.id, 
				"value": action.value
			});
		}
	}
}