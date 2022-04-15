import * as identifier from "../../scripts/identifier.js";

export default class SSSelected {
	constructor (outputElement) {
		this.outputElement = outputElement;
		this.openedUuid = null;
		this.selected = {
			array: null, 
			identityString: null, 
			action: null
		};
	}
	
	updateSelected (selected) {
		if (JSON.stringify(this.selected) === JSON.stringify(selected)) {
			this.outputElement.innerHTML = "";
			this.selected = {
				array: null, 
				identityString: null, 
				action: null
			};
		} else {
			this.selected = selected;
			this.outputElement.innerHTML = this.selected.array + "_" + this.selected.identityString + this.selected.action;
		}
		
		window.renderFunction();
	}
	
	async add (array = "") {
		var templateType = this.selected.array.split("_")[0];
		var templateThis = this.selected.array.split("_")[1];
		
		if (templateType === "object") {
			var details = {
				_uuid: {generateKeyCode: 1}
			};
		} else if (templateType === "group") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_group: {generateKeyCode: 2}
			};
		} else if (templateType === "link") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_start: {generateKeyCode: 2}, 
				_end: {generateKeyCode: 3}
			};
		} else if (templateType === "property") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
			};
		}
		
		details["_" + templateThis] = this.openedUuid;
		details._add = true;
		
		window.assembly.clientOnlyMode = true;
		await window.assembly.set(templateType, details);
		this.updateSelected(this.selected);
		window.renderFunction();
	}
	
	async remove () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._remove = true;
		
		window.assembly.clientOnlyMode = true;
		await window.assembly.set(type, details);
		this.updateSelected(this.selected);
		window.renderFunction();
	}
}