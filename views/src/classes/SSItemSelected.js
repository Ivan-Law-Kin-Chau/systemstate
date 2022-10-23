import * as identifier from "../scripts/identifier.js";

export default class SSItemSelected {
	constructor (identityString) {
		this.identityString = identityString;
		this.selectedString = "";
		this.selected = {
			relationship: null, 
			identityString: null, 
			action: null
		};
	}
	
	updateSelected (selected) {
		if (JSON.stringify(this.selected) === JSON.stringify(selected)) {
			this.selectedString = "";
			this.selected = {
				relationship: null, 
				identityString: null, 
				action: null
			};
		} else {
			this.selected = selected;
			this.selectedString = this.selected.relationship + "_" + this.selected.identityString + this.selected.action;
		}
		
		window.renderFunction();
	}
	
	add (relationship = "") {
		this.addAddAction(relationship);
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
	
	async addAddAction (relationship = "") {
		if (relationship === "") {
			var table = this.selected.relationship.split("_")[0];
			var headAttribute = this.selected.relationship.split("_")[1];
		} else {
			var table = relationship.split("_")[0];
			var headAttribute = relationship.split("_")[1];
		}
		
		if (table === "object") {
			var details = {
				_uuid: {generateKeyCode: 1}
			};
		} else if (table === "group") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
			};
		} else if (table === "link") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_start: {generateKeyCode: 2}, 
				_end: {generateKeyCode: 3}
			};
		} else if (table === "property") {
			var details = {
				_uuid: {generateKeyCode: 1}, 
				_parent: {generateKeyCode: 2}
			};
		}
		
		details = await window.assembly.generateKeys(details);
		details["_" + headAttribute] = this.identityString;
		details._add = true;
		
		var identity = identifier.identityFromString(table, identifier.identityToString(table, details));
		await this.render(table, identity, details);
	}
	
	async removeAddAction () {
		var table = this.selected.relationship.split("_")[0];
		var identity = identifier.identityFromString(table, this.selected.identityString);
		await this.render(table, identity, {_removeItem: true});
	}
	
	async addRemoveAction () {
		var table = this.selected.relationship.split("_")[0];
		var identity = identifier.identityFromString(table, this.selected.identityString);
		await this.render(table, identity, {_remove: true});
	}
	
	async removeRemoveAction () {
		var table = this.selected.relationship.split("_")[0];
		var identity = identifier.identityFromString(table, this.selected.identityString);
		await this.render(table, identity, {_removeRemove: true});
	}
	
	async render (table, identity, details) {
		await window.assembly.setState(table, identity, details);
		this.updateSelected(this.selected);
	}
}