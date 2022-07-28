import SSKey from "../../Elements/SSKey.jsx";

import * as React from "react";

export default class Aliase extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			edit: 0, 
			target: props.target
		};
	}
	
	onInputOrChange (classInstance, saveFunction) {
		return function (action) {
			console.log({
				type: "CUSTOM_SAVE", 
				userInterface: "SSAliase", 
				target: action.value
			});
			
			saveFunction({
				target: action.value
			});
			
			classInstance.state.target = action.value;
		}
	}
	
	render () {
		if (this.state.edit === 0) {
			return (<span>
				<span onClick={() => {this.setState({
					edit: 1
				})}}>V</span>: <span onClick={() => {
					window.listener.dispatch({
						"type": "OPEN", 
						"key": this.state.target
					})
				}}>[aliase]</span>
			</span>);
		} else if (this.state.edit === 1) {
			return (<span>
				<span onClick={() => {this.setState({
					edit: 0
				})}}>E</span>: <SSKey id={this.props.source} elementValue={this.state.target} dispatch={(action) => {
					if (action.type === "SAVE") this.onInputOrChange(this, this.props.save)(action);
					return true;
				}}/>
			</span>);
		}
	}
}