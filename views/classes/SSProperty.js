import * as validator from "../scripts/validator.js";
import SSComponent from "./SSComponent.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSProperty extends SSComponent {
	constructor () {
		super();
	}
	
	render (props, state) {
		this.state = JSON.parse(props.state);
		if (this.validate() === true) {
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "parent"], ": ", [true, "input", "name"], ": ", "\n", [true, "textarea", "content"], "\n"];
			return html`${this.generateHTMFromTemplate(props, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSProperty, current state: ");
			console.log(this.state);
			return html``;
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) validateTarget = this.state;
		if (validateTarget._type !== "property") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		if (!(validator.isValidKey(validateTarget._parent))) return false;
		if (!(validator.isValidSingleLineString(validateTarget._name))) return false;
		if (!(validator.isValidMultiLineString(validateTarget._content))) return false;
		return true;
	}
}