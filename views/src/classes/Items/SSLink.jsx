import * as elements from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.jsx";

import * as React from "react";

export default class SSLink extends SSItem {
	constructor () {
		super();
	}
	
	render () {
		this.assembly = this.props.assembly;
		this.identityString = this.props.identityString;
		this.item = this.assembly.state["link"][this.identityString];
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
			const SSButton = elements["SSButton"];
			
			return (<>
				{"uuid" === templateThis ? <>
					<SSThis key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
					
					{this.itemAddRemove(renderState)}
				</> : <>
					<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_uuid"} elementValue={renderState.item["_uuid"]} red={this.getRed(renderState)}/>
				</>}:{"\u00a0"}
				
				{"start" === templateThis ? <>
					<SSThis key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
					
					{this.itemAddRemove(renderState)}
				</> : <>
					<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_start"} elementValue={renderState.item["_start"]} red={this.getRed(renderState)}/>
				</>}{"\u00a0"}
				
				<SSButton key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_direction"} elementValue={renderState.item["_direction"]} red={this.getRed(renderState)}/>{"\u00a0"}
				
				{"end" === templateThis ? <>
					<SSThis key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} red={this.getRed(renderState)}/>
					
					{this.itemAddRemove(renderState)}
				</> : <>
					<SSKey key={this.identityString + "_" + window.iterator.iterate()} templateType={this.item._type} templateThis={templateThis} id={this.identityString} elementKey={"_end"} elementValue={renderState.item["_end"]} red={this.getRed(renderState)}/>
				</>}
			</>);
		} else if (this.validate() === false) {
			console.log("Invalid SSLink item: ");
			console.log(this.item);
			return "";
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) {
			validateTarget = this.assembly.state["link"][this.identityString];
			if (typeof validateTarget === "undefined") {
				throw "Item not loaded: [\"link\", \"" + this.identityString + "\"]";
			}
		}
		if (validateTarget._type !== "link") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		if (!(validator.isValidKey(validateTarget._start))) return false;
		if (!(validator.isValidKey(validateTarget._end))) return false;
		if (!(validator.isValidDirection(validateTarget._direction))) return false;
		return true;
	}
}