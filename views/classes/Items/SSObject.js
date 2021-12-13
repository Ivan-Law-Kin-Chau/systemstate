import * as validator from "../../scripts/validator.js";
import SSComponent from "./SSComponent.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSObject extends SSComponent {
	constructor () {
		super();
	}
	
	render (props) {
		this.assembly = props.assembly;
		this.identityString = props.identityString;
		this.state = this.assembly.state["object"][this.identityString];
		if (this.validate() === true) {
			var templateThis = props.templateThis ? props.templateThis : null;
			var templateArray = [[false, "selector"], [true, "key"], [], " this"];
			return html`${this.generateHTMFromTemplate(props.identityString, this.state, templateThis, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSObject, current state: ");
			console.log(this.state);
			return html``;
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