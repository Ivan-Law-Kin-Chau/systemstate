import SSItem from "../../SSItem.jsx";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export default class SSObject {
	constructor (identityString) {
		// The head identity string of the class instance
		identifier.assertIdentityStringLength(8, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		this.state.item = window.assembly.state["object"][this.identityString];
		if (await this.validate(this.identityString) !== true) {
			console.log("Invalid SSObject item: ");
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
			
			{SSItem.itemAddRemove(renderState)}{"\u00a0"}this
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
		const item = window.assembly.state["object"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["object", "${identityString}"]`;
		return SSObject.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._type !== "object") return false;
		if (!(validator.isValidKey(item._uuid))) return false;
		return true;
	}
}