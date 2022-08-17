import * as React from "react";
import SSWindow from "./SSWindow.jsx";

export default class SSWindowSelected extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			selectedWindow: null, 
			selectedWindowClassInstance: null
		};
	}
	
	render () {
		return (<span>
			{(this.state.selectedWindow === null) ? (<>
				User Interface: <select/><br/>
				Low-Level Mode: <select/><br/>
				<button>(Add)</button>&nbsp;
				<button>(Load)</button>&nbsp;
				<button>(Save)</button>&nbsp;
				<button>(Remove)</button>&nbsp;
				<button>(Validate)</button><br/>
			</>) : (<>
				User Interface: <select value={this.state.selectedWindowClassInstance.selected.userInterface} onChange={event => {
					this.state.selectedWindowClassInstance.selected.userInterface = event.target.value;
					window.renderFunction();
				}}>
					<option>SSAliase</option>
					<option>SSEditor</option>
					<option>SSObject</option>
					<option>SSGroup</option>
					<option>SSLink</option>
					<option>SSProperty</option>
				</select><br/>
				Low-Level Mode: <select value={this.state.selectedWindowClassInstance.selected.lowLevelMode} onChange={event => {
					this.state.selectedWindowClassInstance.selected.lowLevelMode = event.target.value;
					window.renderFunction();
				}}>
					<option value={null}>Default</option>
					<option value={true}>On</option>
					<option value={false}>Off</option>
				</select><br/>
				<button onClick={this.state.selectedWindowClassInstance.addUserInterface.bind(this.state.selectedWindowClassInstance)}>(Add)</button>&nbsp;
				<button onClick={this.state.selectedWindowClassInstance.loadUserInterface.bind(this.state.selectedWindowClassInstance)}>(Load)</button>&nbsp;
				<button onClick={this.state.selectedWindowClassInstance.saveUserInterface.bind(this.state.selectedWindowClassInstance)}>(Save)</button>&nbsp;
				<button onClick={this.state.selectedWindowClassInstance.removeUserInterface.bind(this.state.selectedWindowClassInstance)}>(Remove)</button>&nbsp;
				<button onClick={this.state.selectedWindowClassInstance.validateUserInterface.bind(this.state.selectedWindowClassInstance)}>(Validate)</button><br/>
			</>)}<br/>
			<SSWindow identityString="fzYkA7sH" windowString="root" selected={"root" === this.state.selectedWindow} selectedWindow={this.state.selectedWindow} setSelectedWindow={(selectedWindow, selectedWindowClassInstance) => {
				if (this.state.selectedWindow === selectedWindow) {
					this.setState({
						selectedWindow: null, 
						selectedWindowClassInstance: null
					});
				} else {
					this.setState({
						selectedWindow: selectedWindow, 
						selectedWindowClassInstance: selectedWindowClassInstance
					});
				}
			}} isRoot/>
		</span>);
	}
}