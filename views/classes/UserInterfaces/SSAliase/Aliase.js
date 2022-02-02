import SSKey from "../../Elements/SSKey.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class Aliase extends Component {
	onInputOrChange (classInstance, saveFunction) {
		return function (action) {
			saveFunction({
				target: action.value
			});
			
			classInstance.props.target = action.value;
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
			return html`<span>
				<span onclick=${() => {this.setState({
					edit: 0
				})}}>E</span>: <${SSKey} id=${this.props.source} elementValue=${this.props.target} dispatch=${(action) => {
					if (action.type === "SAVE") this.onInputOrChange(this, this.props.save)(action);
					return true;
				}}/>
			</span>`;
		}
	}
}