import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.jsx";

import * as React from "react";

export default class SSObject extends SSItem {
	constructor () {
		super();
	}
	
	render () {
		this.assembly = this.props.assembly;
		this.identityString = this.props.identityString;
		this.item = this.assembly.state["object"][this.identityString];
		if (this.validate() === true) {
			var templateThis = this.props.templateThis ? this.props.templateThis : null;
			var templateArray = [[false, "selector"], [true, "key"], [], " this"];
			return this.generateJSXFromTemplate(this.props.identityString, this.props.selectedObject, this.item, templateThis, templateArray);
		} else if (this.validate() === false) {
			console.log("Invalid SSObject item: ");
			console.log(this.item);
			return "";
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) {
			validateTarget = this.assembly.state["object"][this.identityString];
			if (typeof validateTarget === "undefined") {
				throw "Item not loaded: [\"object\", \"" + this.identityString + "\"]";
			}
		}
		if (validateTarget._type !== "object") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		return true;
	}
}