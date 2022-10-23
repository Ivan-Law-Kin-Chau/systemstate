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
	
	async addAddAction (array = "") {
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
		
		details = await window.assembly.generateKeys(details);
		details["_" + headAttribute] = this.identityString;
		details._add = true;
		
		var identity = identifier.identityFromString(type, identifier.identityToString(type, details));
		await this.render(type, identity, details);
	}
	
	async removeAddAction () {
		var type = this.selected.array.split("_")[0];
		var identity = identifier.identityFromString(type, this.selected.identityString);
		await this.render(type, identity, {_removeItem: true});
	}
	
	async addRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var identity = identifier.identityFromString(type, this.selected.identityString);
		await this.render(type, identity, {_remove: true});
	}
	
	async removeRemoveAction () {
		var type = this.selected.array.split("_")[0];
		var identity = identifier.identityFromString(type, this.selected.identityString);
		await this.render(type, identity, {_removeRemove: true});
	}
	
	async render (type, identity, details) {
		await window.assembly.setState(type, identity, details);
		this.updateSelected(this.selected);
	}
}