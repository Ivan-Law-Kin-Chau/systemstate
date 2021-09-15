import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSSelector extends Component {
	constructor () {
		super();
	}
	
	onClick (classInstance) {
		return function (event) {
			selectElement(classInstance.props.id);
		}
	}
	
	render (props, state) {
		let style;
		if (props.red === "0") {
			style = "color: #000000;";
		} else if (props.red === "1") {
			style = "color: #FF0000;";
		}
		
		return html`<span id=${props.id} onClick=${this.onClick(this)} style=${style}>#</span>`;
	}
}