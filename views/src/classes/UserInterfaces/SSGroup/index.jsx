import SSItem from "../../SSItem.jsx";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export default class SSGroup {
	constructor (identityString) {
		// The head identity string of the class instance
		identifier.assertIdentityStringLength(17, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		this.state.item = window.assembly.state["group"][this.identityString];
		if (await this.validate(this.identityString) !== true) {
			console.log("Invalid SSGroup item: ");
			console.log(this.state.item);
			return "";
		}
		
		var templateThis = action.templateThis ? action.templateThis : null;
		var renderState = {
			item: this.state.item, 
			identityString: this.identityString, 
			selectedObject: action.selectedObject, 
			templateThis: templateThis
		};
		
		const SSSelector = elements["SSSelector"];
		const SSKey = elements["SSKey"];
		
		return (<>
			<SSSelector templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
			
			<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_" + templateThis} elementValue={this.state.item["_" + templateThis]} red={SSItem.getRed(renderState)}/>
			
			{SSItem.itemAddRemove(renderState)}
		</>);
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
		return true;
	}
	
	async validate (identityString) {
		if (typeof identityString === "undefined") identityString = this.identityString;
		const item = window.assembly.state["group"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["group", "${identityString}"]`;
		return SSGroup.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._type !== "group") return false;
		if (!(validator.isValidKey(item._uuid))) return false;
		if (!(validator.isValidKey(item._parent))) return false;
		return true;
	}
}