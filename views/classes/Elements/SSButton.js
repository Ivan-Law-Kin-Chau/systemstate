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
			if (classInstance.state.elementValue === null) {
				newValue = true;
			} else if (classInstance.state.elementValue === true) {
				newValue = false;
			} else if (classInstance.state.elementValue === false) {
				newValue = null;
			}
			
			window.listener.dispatch({
				"type": "SAVE", 
				"targetType": classInstance.props.type, 
				"targetId": event.target.id, 
				"key": classInstance.props.elementKey, 
				"value": newValue
			});
			
			classInstance.props.elementValue = convertor.convertBooleanToHTML(newValue);
			classInstance.setState({
				elementValue: newValue
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.elementValue === "undefined") this.setState({
			elementValue: convertor.convertHTMLToBoolean(props.elementValue)
		});
		
		let style = "color: #000000;";
		
		return html`<button id=${props.id} onClick=${this.onClick(this)} style=${style}>${convertor.convertBooleanToDirection(convertor.convertHTMLToBoolean(props.elementValue))}</button>`;
	}
}