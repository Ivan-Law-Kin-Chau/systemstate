import SSItem from "../../SSItem.jsx";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export default class SSProperty {
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
		this.state.item = window.assembly.state["property"][this.identityString];
		if (await this.validate(this.identityString) === false) {
			console.log("Invalid SSProperty item: ");
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
		
		const SSThis = elements["SSThis"];
		const SSKey = elements["SSKey"];
		const SSInput = elements["SSInput"];
		const SSTextarea = elements["SSTextarea"];
		
		return (<>
			{"uuid" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
				
				{SSItem.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_uuid"} elementValue={this.state.item["_uuid"]} red={SSItem.getRed(renderState)}/>
			</>}:{"\u00a0"}
			
			{"parent" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
				
				{SSItem.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_parent"} elementValue={this.state.item["_parent"]} red={SSItem.getRed(renderState)}/>
			</>}:{"\u00a0"}
			
			<SSInput templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_name"} elementValue={this.state.item["_name"]} red={SSItem.getRed(renderState)}/>:{"\u00a0"}<br/>
			
			<SSTextarea templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_content"} elementValue={this.state.item["_content"]} red={SSItem.getRed(renderState)}/>
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
		const item = window.assembly.state["property"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["property", "${identityString}"]`;
		return SSProperty.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._type !== "property") return false;
		if (!(validator.isValidKey(item._uuid))) return false;
		if (!(validator.isValidKey(item._parent))) return false;
		if (!(validator.isValidSingleLineString(item._name))) return false;
		if (!(validator.isValidMultiLineString(item._content))) return false;
		return true;
	}
}