import SSItem from "../../SSItem.jsx";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export default class SSLink {
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
		this.state.item = window.assembly.state["link"][this.identityString];
		if (await this.validate(this.identityString) !== true) {
			console.log("Invalid SSLink item: ");
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
		const SSButton = elements["SSButton"];
		
		return (<>
			{"uuid" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
				
				{SSItem.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_uuid"} elementValue={renderState.item["_uuid"]} red={SSItem.getRed(renderState)}/>
			</>}:{"\u00a0"}
			
			{"start" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
				
				{SSItem.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_start"} elementValue={renderState.item["_start"]} red={SSItem.getRed(renderState)}/>
			</>}{"\u00a0"}
			
			<SSButton templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_direction"} elementValue={renderState.item["_direction"]} red={SSItem.getRed(renderState)}/>{"\u00a0"}
			
			{"end" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={SSItem.getRed(renderState)}/>
				
				{SSItem.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_end"} elementValue={renderState.item["_end"]} red={SSItem.getRed(renderState)}/>
			</>}
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
		const item = window.assembly.state["link"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["link", "${identityString}"]`;
		return SSLink.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._type !== "link") return false;
		if (!(validator.isValidKey(item._uuid))) return false;
		if (!(validator.isValidKey(item._start))) return false;
		if (!(validator.isValidKey(item._end))) return false;
		if (!(validator.isValidDirection(item._direction))) return false;
		return true;
	}
}