import * as convertor from "../../scripts/convertor.js";
import SSElement from "./SSElement.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSTextarea extends SSElement {
	constructor () {
		super();
	}
	
	onInputOrChange (classInstance) {
		return function (event) {
			classInstance.dispatch({
				"type": "SAVE", 
				"targetType": classInstance.props.type, 
				"targetId": event.target.id, 
				"key": classInstance.props.elementKey, 
				"value": event.target.value
			}, classInstance.props.dispatch || null);
			
			classInstance.props.elementValue = event.target.value;
			classInstance.setState({
				elementValue: event.target.value
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.elementValue === "undefined") this.setState({
			elementValue: props.elementValue
		});
		
		let style = "color: #000000; display: inline-block; position: relative; top: -2px;";
		let dimensions = this.simulate(this.state.elementValue ? this.state.elementValue : "");
		style += " width: " + dimensions.width + ";";
		style += " height: " + dimensions.height + ";";
		
		return html`<textarea id=${props.id} type="text" value=${props.elementValue} onInput=${this.onInputOrChange(this)} onChange=${this.onInputOrChange(this)} style=${style}></textarea>`;
	}
}