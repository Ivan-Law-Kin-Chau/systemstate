import * as convertor from "../../scripts/convertor.js";
import SSElement from "./SSElement.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSRemove extends SSElement {
	constructor () {
		super();
		this.setState({"red": false});
	}
	
	onClick (classInstance) {
		return function (event) {
			classInstance.dispatch({
				"type": "SELECT", 
				"array": classInstance.props.templateType + "_" + classInstance.props.templateThis, 
				"identityString": classInstance.props.id, 
				"action": "_remove"
			}, classInstance.props.dispatch || null);
		}
	}
	
	render (props, state) {
		let style;
		if (props.red === false) {
			style = "color: #000000;";
		} else if (props.red === true) {
			style = "color: #FF0000;";
		}
		
		return html`<span id=${props.id} onClick=${this.onClick(this)} style=${style}>#remove</span>`;
	}
}