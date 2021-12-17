import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSKey extends Component {
	constructor () {
		super();
	}
	
	onInputOrChange (classInstance) {
		return function (event) {
			window.listener.dispatch({
				"type": "SAVE", 
				"targetType": classInstance.props.type, 
				"targetId": event.target.id, 
				"key": classInstance.props.elementKey, 
				"value": event.target.value
			});
			
			classInstance.props.elementValue = event.target.value;
			classInstance.setState({
				elementValue: event.target.value
			});
		}
	}
	
	onClick (classInstance) {
		return function (event) {
			window.listener.dispatch({
				"type": "OPEN", 
				"key": classInstance.state.elementValue
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.elementValue === "undefined") this.setState({
			elementValue: props.elementValue
		});
		
		let style = "color: #000000; min-width: 72px; max-width: 72px; padding: 0px;";
		
		return html`<input id=${props.id} type="input" value=${props.elementValue} maxLength="8" onInput=${this.onInputOrChange(this)} onChange=${this.onInputOrChange(this)} onClick=${this.onClick(this)} style=${style}></input>`;
	}
}