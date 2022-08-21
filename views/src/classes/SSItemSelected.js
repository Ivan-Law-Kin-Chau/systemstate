import * as identifier from "../scripts/identifier.js";

export default class SSItemSelected {
	constructor (identityString) {
		this.identityString = identityString;
		this.selectedString = "";
		this.selected = {
			array: null, 
			identityString: null, 
			action: null
		};
	}
	
	updateSelected (selected) {
		if (JSON.stringify(this.selected) === JSON.stringify(selected)) {
			this.selectedString = "";
			this.selected = {
				array: null, 
				identityString: null, 
				action: null
			};
		} else {
			this.selected = selected;
			this.selectedString = this.selected.array + "_" + this.selected.identityString + this.selected.action;
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
	
	addAddAction (array = "") {
		if (array === "") {
			var type = this.selected.array.split("_")[0];
			var headAttribute = this.selected.array.split("_")[1];
		} else {
			var type = array.split("_")[0];
			var headAttribute = array.split("_")[1];
		}
		
		if (type === "object") {
			var details = {
				_uuid: {generateKeyCode: 1}
			};
		} else if (type === "group") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
			};
		} else if (type === "link") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_start: {generateKeyCode: 2}, 
				_end: {generateKeyCode: 3}
			};
		} else if (type === "property") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
			};
		}
		
		details["_" + headAttribute] = this.identityString;
		details._add = true;
		this.render(type, details);
	}
	
	removeAddAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._removeItem = true;
		this.render(type, details);
	}
	
	addRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._remove = true;
		this.render(type, details);
	}
	
	removeRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var details = identifier.identityFromString(type, this.selected.identityString);
		details._removeRemove = true;
		this.render(type, details);
	}
	
	async render (type, details) {
		window.assembly.clientOnlyMode = true;
		await window.assembly.set(type, details);
		this.updateSelected(this.selected);
	}
}