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
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "parent"], ": ", [true, "input", "name"], ": ", "\n", [true, "textarea", "content"]];
			return this.generateJSXFromTemplate(this.props.identityString, this.props.selectedObject, this.item, templateThis, templateArray);
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