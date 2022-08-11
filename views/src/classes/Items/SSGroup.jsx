import * as elements from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.jsx";

import * as React from "react";

export default class SSGroup extends SSItem {
	constructor () {
		super();
	}
	
	render () {
		this.assembly = this.props.assembly;
		this.identityString = this.props.identityString;
		this.item = this.assembly.state["group"][this.identityString];
		if (this.validate() === true) {
			var templateThis = this.props.templateThis ? this.props.templateThis : null;
			var renderState = {
				item: this.item, 
				identityString: this.identityString, 
				selectedObject: this.props.selectedObject, 
				templateThis: templateThis
			};
			
			const SSSelector = elements["SSSelector"];
			const SSKey = elements["SSKey"];
			
			return (<>
				<SSSelector key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
				
				<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_" + templateThis} elementValue={this.item["_" + templateThis]} red={this.getRed(renderState)}/>
				
				{this.itemAddRemove(renderState)}
			</>);
		} else if (this.validate() === false) {
			console.log("Invalid SSGroup item: ");
			console.log(this.item);
			return "";
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) {
			validateTarget = this.assembly.state["group"][this.identityString];
			if (typeof validateTarget === "undefined") {
				throw "Item not loaded: [\"group\", \"" + this.identityString + "\"]";
			}
		}
		if (validateTarget._type !== "group") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		if (!(validator.isValidKey(validateTarget._parent))) return false;
		return true;
	}
}