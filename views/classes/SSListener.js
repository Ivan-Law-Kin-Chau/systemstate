import * as identifier from "../../scripts/identifier.js";

export default class SSListener {
	constructor (assembly, selected) {
		this.assembly = assembly;
		this.selected = selected;
	}
	
	// Called by the element classes in order to change the state in the SSAssembly class
	// TODO: Add the code to change the state in the SSAssembly class: 
	//  - If the key or id here is something like "class_SSEditor_abcccccc", send the action to the relevant user interface class
	//  - Otherwise, change the state in the SSAssembly class directly
	async dispatch (action = {}) {
		if (action.type === "SELECT") {
			delete action.type;
			this.selected.updateSelected(action);
			console.log("Select Element: " + action.identityString);
		} else if (action.type === "OPEN") {
			console.log("Open Key: " + action.key);
		} else if (action.type === "SAVE") {
			let content = {};
			content[action.key] = action.value;
			
			const identity = identifier.identityFromString(action.targetType, action.targetId);
			if (await this.assembly.setState(action.targetType, identity, content)) {
				console.log({
					"type": action.targetType, 
					"id": action.targetId, 
					"key": action.key, 
					"value": action.value
				});
			} else {
				throw "Set state failed";
			}
		}
	}
}