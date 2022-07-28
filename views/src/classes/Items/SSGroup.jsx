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
			var templateArray = [[false, "selector"], [true, "key"], []];
			return this.generateJSXFromTemplate(this.props.identityString, this.props.selectedObject, this.item, templateThis, templateArray);
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