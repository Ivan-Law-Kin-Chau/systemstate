import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSKey extends Component {
	constructor () {
		super();
	}
	
	onChange (classInstance) {
		return function (event) {
			window.listener.dispatch({
				"type": "SAVE", 
				"id": event.target.id, 
				"value": event.target.value, 
			});
			
			classInstance.props.value = event.target.value;
			classInstance.setState({
				value: event.target.value
			});
		}
	}
	
	onClick (classInstance) {
		return function (event) {
			window.listener.dispatch({
				"type": "OPEN", 
				"key": classInstance.state.value
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.value === "undefined") this.setState({
			value: props.value
		});
		
		let style = "color: #000000; min-width: 72px; max-width: 72px; padding: 0px;";
		
		return html`<input id=${props.id} type="input" value=${props.value} maxLength="8" onChange=${this.onChange(this)} onClick=${this.onClick(this)} style=${style}></input>`;
	}
}