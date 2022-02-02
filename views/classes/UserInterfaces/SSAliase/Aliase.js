import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class Aliase extends Component {
	onInputOrChange (classInstance, saveFunction) {
		return function (event) {
			saveFunction({
				target: event.target.value
			});
			
			classInstance.props.target = event.target.value;
		}
	}
	
	render (props) {
		if (typeof this.state.edit === "undefined") this.setState({edit: 0});
		if (this.state.edit === 0) {
			return html`<span>
				<span onclick=${() => {this.setState({
					edit: 1
				})}}>V</span>: <span onclick=${() => {
					window.listener.dispatch({
						"type": "OPEN", 
						"key": props.target
					})
				}}>[aliase]</span>
			</span>`;
		} else if (this.state.edit === 1) {
			let style = "color: #000000; min-width: 72px; max-width: 72px; padding: 0px;";
			
			return html`<span>
				<span onclick=${() => {this.setState({
					edit: 0
				})}}>E</span>: <input type="input" value=${props.target} maxLength="8" onInput=${this.onInputOrChange(this, props.save)} onChange=${this.onInputOrChange(this, props.save)} style=${style}></input>
			</span>`;
		}
	}
}