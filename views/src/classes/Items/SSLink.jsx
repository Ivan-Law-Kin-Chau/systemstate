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
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "start"], " ", [true, "button", "direction"], " ", [true, "key", "end"]];
			return this.generateJSXFromTemplate(this.props.identityString, this.props.selectedObject, this.item, templateThis, templateArray);
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