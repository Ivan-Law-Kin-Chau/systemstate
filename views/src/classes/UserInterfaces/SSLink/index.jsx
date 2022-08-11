import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import SSItem from "../SSItem/index.jsx";

import * as React from "react";

export default class SSLink extends SSItem {
	constructor (identityString, assembly, selected, listener) {
		super(identityString, assembly, selected, listener);
	}
	
	async load (action = {}) {
		this.state.item = this.assembly.state["link"][this.identityString];
		if (await this.validate(this.assembly, this.identityString) !== true) {
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
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
				
				{this.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_uuid"} elementValue={renderState.item["_uuid"]} red={this.getRed(renderState)}/>
			</>}:{"\u00a0"}
			
			{"start" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
				
				{this.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_start"} elementValue={renderState.item["_start"]} red={this.getRed(renderState)}/>
			</>}{"\u00a0"}
			
			<SSButton templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_direction"} elementValue={renderState.item["_direction"]} red={this.getRed(renderState)}/>{"\u00a0"}
			
			{"end" === templateThis ? <>
				<SSThis templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
				
				{this.itemAddRemove(renderState)}
			</> : <>
				<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_end"} elementValue={renderState.item["_end"]} red={this.getRed(renderState)}/>
			</>}
		</>);
	}
	
	async validate (assembly, identityString) {
		if (typeof identityString === "undefined") identityString = this.identityString;
		const item = assembly.state["link"][identityString];
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