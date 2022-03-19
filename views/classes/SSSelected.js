import * as identifier from "../../scripts/identifier.js";

export default class SSSelected {
	constructor (outputElement) {
		this.outputElement = outputElement;
		this.selected = {
			"array": null, 
			"identityString": null, 
			"action": null
		};
	}
	
	updateSelected (selected) {
		if (JSON.stringify(this.selected) === JSON.stringify(selected)) {
			this.outputElement.innerHTML = "";
			this.selected = {
				"array": null, 
				"identityString": null, 
				"action": null
			};
		} else {
			this.selected = selected;
			this.outputElement.innerHTML = this.selected.array + "_" + this.selected.identityString + this.selected.action;
		}
		
		window.renderFunction();
	}
}