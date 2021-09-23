import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class Button extends Component {
	constructor () {
		super();
	}
	
	onClick (classInstance) {
		return function (event) {
			var newValue;
			if (classInstance.state.value === null) {
				newValue = true;
			} else if (classInstance.state.value === true) {
				newValue = false;
			} else if (classInstance.state.value === false) {
				newValue = null;
			}
			
			console.log({
				"id": event.target.id, 
				"value": newValue, 
			});
			
			classInstance.props.value = convertor.convertBooleanToHTML(newValue);
			classInstance.setState({
				value: newValue
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.value === "undefined") this.setState({
			value: convertor.convertHTMLToBoolean(props.value)
		});
		
		let style = "";
		if (props.red === "0") {
			style += " color: #000000;";
		} else if (props.red === "1") {
			style += " color: #FF0000;";
		}
		
		return html`<button id=${props.id} onClick=${this.onClick(this)} style=${style}>${convertor.convertBooleanToDirection(convertor.convertHTMLToBoolean(props.value))}</button>`;
	}
}