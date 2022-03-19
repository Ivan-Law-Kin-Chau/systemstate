import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSProperty extends SSItem {
	constructor () {
		super();
	}
	
	render (props) {
		this.assembly = props.assembly;
		this.identityString = props.identityString;
		this.state = this.assembly.state["property"][this.identityString];
		if (this.validate() === true) {
			var templateThis = props.templateThis ? props.templateThis : null;
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "parent"], ": ", [true, "input", "name"], ": ", "\n", [true, "textarea", "content"]];
			return html`${this.generateHTMFromTemplate(props.identityString, props.selectedObject, this.state, templateThis, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSProperty, current state: ");
			console.log(this.state);
			return html``;
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