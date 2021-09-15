import { h, Component, render } from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSTextarea extends Component {
	constructor () {
		super();
	}
	
	onInputOrChange (classInstance) {
		return function (event) {
			console.log({
				"id": event.target.id, 
				"value": event.target.value, 
			});
			
			classInstance.props.value = event.target.value;
			classInstance.setState({
				value: event.target.value
			});
		}
	}
	
	render (props, state) {
		if (typeof this.state.value === "undefined") this.setState({
			value: props.value
		});
		
		let style = "display: inline-block; position: relative; top: -2px;";
		if (props.red === "0") {
			style += " color: #000000;";
		} else if (props.red === "1") {
			style += " color: #FF0000;";
		}
		
		let dimensions = window.simulate(this.state.value ? this.state.value : "");
		style += " width: " + dimensions.width + ";";
		style += " height: " + dimensions.height + ";";
		
		return html`<textarea id=${props.id} type="text" value=${props.value} onInput=${this.onInputOrChange(this)} onChange=${this.onInputOrChange(this)} style=${style}></textarea>`;
	}
}