import * as validator from "../../scripts/validator.js";
import SSItem from "./SSItem.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSGroup extends SSItem {
	constructor () {
		super();
	}
	
	render (props) {
		this.assembly = props.assembly;
		this.identityString = props.identityString;
		this.state = this.assembly.state["group"][this.identityString];
		if (this.validate() === true) {
			var templateThis = props.templateThis ? props.templateThis : null;
			var templateArray = [[false, "selector"], [true, "key"], []];
			return html`${this.generateHTMFromTemplate(props.identityString, this.state, templateThis, templateArray)}`;
		} else if (this.validate() === false) {
			console.log("Invalid SSGroup, current state: ");
			console.log(this.state);
			return html``;
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