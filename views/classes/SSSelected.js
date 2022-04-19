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
	
	add (array = "") {
		this.addAddAction(array);
	}
	
	remove () {
		if (this.selected.action === null) return;
		if (this.selected.action === "_element") {
			this.addRemoveAction();
		} else if (this.selected.action === "_add") {
			this.removeAddAction();
		} else if (this.selected.action === "_remove") {
			this.removeRemoveAction();
		}
	}
	
	async addAddAction (array = "") {
		if (array === "") {
			var templateType = this.selected.array.split("_")[0];
			var templateThis = this.selected.array.split("_")[1];
		} else {
			var templateType = array.split("_")[0];
			var templateThis = array.split("_")[1];
		}
		
		if (templateType === "object") {
			var details = {
				_uuid: {generateKeyCode: 1}
			};
		} else if (templateType === "group") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
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
		this.render(templateType, details);
	}
	
	async removeAddAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._removeItem = true;
		this.render(type, details);
	}
	
	async addRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._remove = true;
		this.render(type, details);
	}
	
	async removeRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._removeRemove = true;
		this.render(type, details);
	}
	
	async render (type, details) {
		window.assembly.clientOnlyMode = true;
		await window.assembly.set(type, details);
		this.updateSelected(this.selected);
		window.renderFunction();
	}
}