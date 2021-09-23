import * as validator from "../scripts/validator.js";
import SSComponent from "./SSComponent.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSLink extends SSComponent {
	constructor () {
		super();
	}
	
	render (props, state) {
		this.state = JSON.parse(props.state);
		if (this.validate() === true) {
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "start"], " ", [true, "button", "direction"], " ", [true, "key", "end"], "\n"];
			return html`${this.generateHTMFromTemplate(props, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSLink, current state: ");
			console.log(this.state);
			return html``;
		}
	}
	
	validate () {
		if (this.state._type !== "link") return false;
		if (!(validator.isValidKey(this.state._uuid))) return false;
		if (!(validator.isValidKey(this.state._start))) return false;
		if (!(validator.isValidKey(this.state._end))) return false;
		if (!(validator.isValidDirection(this.state._direction))) return false;
		return true;
	}
}