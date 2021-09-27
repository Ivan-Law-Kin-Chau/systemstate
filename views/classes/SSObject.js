import * as validator from "../scripts/validator.js";
import SSComponent from "./SSComponent.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSObject extends SSComponent {
	constructor () {
		super();
	}
	
	render (props, state) {
		this.state = JSON.parse(props.state);
		if (this.validate() === true) {
			var templateArray = [[false, "selector"], [true, "key"], [], " this", ", "];
			return html`${this.generateHTMFromTemplate(props, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSObject, current state: ");
			console.log(this.state);
			return html``;
		}
	}
	
	validate (validateTarget = null) {
		if (validateTarget === null) validateTarget = this.state;
		if (validateTarget._type !== "object") return false;
		if (!(validator.isValidKey(validateTarget._uuid))) return false;
		return true;
	}
}