import * as validator from "../scripts/validator.js";
import SSComponent from "./SSComponent.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSGroup extends SSComponent {
	constructor () {
		super();
	}
	
	render (props, state) {
		this.state = JSON.parse(props.state);
		if (this.validate() === true) {
			var templateArray = [[false, "selector"], [true, "key"], [], ", "];
			return html`${this.generateHTMFromTemplate(props, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSGroup, current state: ");
			console.log(this.state);
			return html``;
		}
	}
	
	validate () {
		if (this.state._type !== "group") return false;
		if (!(validator.isValidKey(this.state._uuid))) return false;
		if (!(validator.isValidKey(this.state._parent))) return false;
		return true;
	}
}