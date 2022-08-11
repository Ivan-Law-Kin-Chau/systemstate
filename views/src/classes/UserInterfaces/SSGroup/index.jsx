import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import SSItem from "../SSItem/index.jsx";

import * as React from "react";

export default class SSGroup extends SSItem {
	constructor (identityString, assembly, selected, listener) {
		super(identityString, assembly, selected, listener);
	}
	
	async load (action = {}) {
		this.state.item = this.assembly.state["group"][this.identityString];
		if (await this.validate(this.assembly, this.identityString) !== true) {
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
			<SSSelector templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
			
			<SSKey templateType={this.state.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_" + templateThis} elementValue={this.state.item["_" + templateThis]} red={this.getRed(renderState)}/>
			
			{this.itemAddRemove(renderState)}
		</>);
	}
	
	async validate (assembly, identityString) {
		if (typeof identityString === "undefined") identityString = this.identityString;
		const item = assembly.state["group"][identityString];
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