import * as elements from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.jsx";

import * as React from "react";

export default class SSProperty extends SSItem {
	constructor () {
		super();
	}
	
	render () {
		this.assembly = this.props.assembly;
		this.identityString = this.props.identityString;
		this.item = this.assembly.state["property"][this.identityString];
		if (this.validate() === true) {
			var templateThis = this.props.templateThis ? this.props.templateThis : null;
			var renderState = {
				item: this.item, 
				identityString: this.identityString, 
				selectedObject: this.props.selectedObject, 
				templateThis: templateThis
			};
			
			const SSThis = elements["SSThis"];
			const SSKey = elements["SSKey"];
			const SSInput = elements["SSInput"];
			const SSTextarea = elements["SSTextarea"];
			
			return (<>
				{"uuid" === templateThis ? <>
					<SSThis key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
					
					{this.itemAddRemove(renderState)}
				</> : <>
					<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_uuid"} elementValue={this.item["_uuid"]} red={this.getRed(renderState)}/>
				</>}:{"\u00a0"}
				
				{"parent" === templateThis ? <>
					<SSThis key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
					
					{this.itemAddRemove(renderState)}
				</> : <>
					<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_parent"} elementValue={this.item["_parent"]} red={this.getRed(renderState)}/>
				</>}:{"\u00a0"}
				
				<SSInput key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_name"} elementValue={this.item["_name"]} red={this.getRed(renderState)}/>:{"\u00a0"}<br key={this.identityString + "_" + window.iterator.iterate()}/>
				
				<SSTextarea key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_content"} elementValue={this.item["_content"]} red={this.getRed(renderState)}/>
			</>);
		} else if (this.validate() === false) {
			console.log("Invalid SSProperty item: ");
			console.log(this.item);
			return "";
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) {
			validateTarget = this.assembly.state["property"][this.identityString];
			if (typeof validateTarget === "undefined") {
				throw "Item not loaded: [\"property\", \"" + this.identityString + "\"]";
			}
		}
		if (validateTarget._type !== "property") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		if (!(validator.isValidKey(validateTarget._parent))) return false;
		if (!(validator.isValidSingleLineString(validateTarget._name))) return false;
		if (!(validator.isValidMultiLineString(validateTarget._content))) return false;
		return true;
	}
}