import * as identifier from "../scripts/identifier.js";

export default class SSListener {
	static async dispatch (selected, action = {}) {
		if (action.type === "SELECT") {
			delete action.type;
			selected.updateSelected(action);
			console.log("Select Element: " + action.identityString);
		} else if (action.type === "OPEN") {
			console.log("Open Key: " + action.key);
		} else if (action.type === "SAVE") {
			let value = {};
			value[action.attribute] = action.value;
			
			const identity = identifier.identityFromString(action.targetType, action.targetId);
			if (await window.assembly.setState(action.targetType, identity, value)) {
				console.log({
					"type": action.targetType, 
					"id": action.targetId, 
					"attribute": action.attribute, 
					"value": action.value
				});
			} else {
				throw "Set state failed";
			}
		}
	}
}