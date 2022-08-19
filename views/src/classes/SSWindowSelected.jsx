import * as React from "react";
import SSWindow from "./SSWindow.jsx";

export default class SSWindowSelected extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			selectedWindow: null, 
			selectedWindowClassInstance: null, 
			selectedUserInterface: null, 
			selectedLowLevelMode: false
		};
	}
	
	render () {
		const ref = React.createRef();
		const windowSelected = this;
		const setSelectedWindow = (windowString, ref) => () => {
			if (windowSelected.state.selectedWindow === windowString) {
				windowSelected.setState({
					selectedWindow: null, 
					selectedWindowClassInstance: null, 
					selectedUserInterface: null, 
					selectedLowLevelMode: false
				});
			} else {
				windowSelected.setState({
					selectedWindow: windowString, 
					selectedWindowClassInstance: ref.current, 
					selectedUserInterface: ref.current.state.userInterface, 
					selectedLowLevelMode: ref.current.state.lowLevelMode
				});
			}
		}
		
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
				User Interface: <select value={this.state.selectedUserInterface} onChange={event => {
					this.setState({selectedUserInterface: event.target.value});
					window.renderFunction();
				}}>
					<option>SSAliase</option>
					<option>SSEditor</option>
					<option>SSObject</option>
					<option>SSGroup</option>
					<option>SSLink</option>
					<option>SSProperty</option>
				</select><br/>
				Low-Level Mode: <select value={this.state.selectedLowLevelMode} onChange={event => {
					this.setState({selectedLowLevelMode: event.target.value});
					window.renderFunction();
				}}>
					<option value={null}>Default</option>
					<option value={true}>On</option>
					<option value={false}>Off</option>
				</select><br/>
				<button onClick={() => this.state.selectedWindowClassInstance.addUserInterface(this.state.selectedUserInterface)}>(Add)</button>&nbsp;
				<button onClick={() => this.state.selectedWindowClassInstance.loadUserInterface(this.state.selectedUserInterface)}>(Load)</button>&nbsp;
				<button onClick={() => this.state.selectedWindowClassInstance.saveUserInterface(this.state.selectedUserInterface)}>(Save)</button>&nbsp;
				<button onClick={() => this.state.selectedWindowClassInstance.removeUserInterface(this.state.selectedUserInterface)}>(Remove)</button>&nbsp;
				<button onClick={() => this.state.selectedWindowClassInstance.validateUserInterface(this.state.selectedUserInterface)}>(Validate)</button><br/>
			</>)}<br/>
			<SSWindow identityString="fzYkA7sH" key="root" windowString="root" selectedWindow={this.state.selectedWindow} setSelectedWindow={setSelectedWindow} setSelectedWindowWithRef={setSelectedWindow("root", ref)} ref={ref} isRoot/><br/><br/>
			
			Documentations: <button onClick={() => window.open("/resources/documentations.html", "_blank")}>(View)</button><br/>
			
			Editor Actions: <button onClick={() => {
				this.setState(
					{
						selectedWindow: null, 
						selectedWindowClassInstance: null, 
						selectedUserInterface: null, 
						selectedLowLevelMode: false
					}, 
					() => {
						window.assembly.syncWithServer().then(
							() => window.renderFunction()
						)
					}
				);
			}}>(Save)</button><br/>
		</span>);
	}
}