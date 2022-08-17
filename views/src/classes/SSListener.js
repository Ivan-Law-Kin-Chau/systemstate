import * as identifier from "../scripts/identifier.js";

export default class SSListener {
	static async dispatch (action = {}) {
		if (action.type === "SELECT") {
			delete action.type;
			window.selected.updateSelected(action);
			console.log("Select Element: " + action.identityString);
		} else if (action.type === "OPEN") {
			console.log("Open Key: " + action.key);
		} else if (action.type === "SAVE") {
			let content = {};
			content[action.key] = action.value;
			
			const identity = identifier.identityFromString(action.targetType, action.targetId);
			if (await window.assembly.setState(action.targetType, identity, content)) {
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