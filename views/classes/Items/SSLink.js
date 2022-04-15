import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSLink extends SSItem {
	constructor () {
		super();
	}
	
	render (props) {
		this.assembly = props.assembly;
		this.identityString = props.identityString;
		this.item = this.assembly.state["link"][this.identityString];
		if (this.validate() === true) {
			var templateThis = props.templateThis ? props.templateThis : null;
			var templateArray = [[true, "key", "uuid"], ": ", [true, "key", "start"], " ", [true, "button", "direction"], " ", [true, "key", "end"]];
			return html`${this.generateHTMFromTemplate(props.identityString, props.selectedObject, this.item, templateThis, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSLink item: ");
			console.log(this.item);
			return html``;
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