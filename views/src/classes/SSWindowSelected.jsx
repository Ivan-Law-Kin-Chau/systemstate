import * as userInterfaces from "./UserInterfaces/All.js";
import * as React from "react";
import SSWindow from "./SSWindow.jsx";

// import ReactAsyncDevTools from "react-async-devtools";

export default class SSWindowSelected extends React.Component {
	constructor (props) {
		super(props);
		
		this.setSelectedWindow = this.setSelectedWindow.bind(this);
		this.state = {
			selectedWindow: null, 
			selectedWindowClassInstance: null, 
			selectedUserInterface: null, 
			selectedLowLevelMode: false, 
			availableUserInterfaces: [], 
			allUserInterfaces: ["SSAliase", "SSEditor", "SSObject", "SSGroup", "SSLink", "SSProperty"]
		};
	}
	
	/*
	
	We are trying to give the (#) buttons in all the windows their onClick callback functions that change the state of the SSWindowSelected component (right here). As the windows are descendant components of SSWindowSelected, for the callback functions to change the state of SSWindowSelected, the callback functions have to be created here and passed down as props all the way to the windows the (#) buttons are in, for this to work in React. However, each (#) button's callback function has to set the state according to the ref of that window. If we just create a callback function here and pass it down to those windows as a prop, we cannot add a reference to such a ref. Therefore, we create a factory function called setSelectedWindow here and then pass it down as a prop that every single descendant window can access. When the descendant windows are being rendered, this factory function will be called (with the ref as one of the arguments) to create another setSelectedWindowWithRef function, passed down to that particular window as another prop. Then, when the (#) button in that window is pressed, the setSelectedWindowWithRef function will be called, setting the state here according to the ref of that window
	
	*/
	setSelectedWindow (windowString, ref) {
		return async () => {
			if (this.state.selectedWindow === windowString) {
				this.setState({
					selectedWindow: null, 
					selectedWindowClassInstance: null, 
					selectedUserInterface: null, 
					selectedLowLevelMode: false, 
					availableUserInterfaces: []
				});
			} else {
				this.setState({
					selectedWindow: windowString, 
					selectedWindowClassInstance: ref.current, 
					selectedUserInterface: ref.current.state.userInterface, 
					selectedLowLevelMode: ref.current.state.lowLevelMode, 
					availableUserInterfaces: await this.getAvailableUserInterfaces(windowString, ref.current)
				});
			}
		}
	}
	
	async getAvailableUserInterfaces (selectedWindow = this.state.selectedWindow, selectedWindowClassInstance = this.state.selectedWindowClassInstance) {
		let availableUserInterfaces = this.state.availableUserInterfaces;
		
		if (selectedWindow !== null) {
			availableUserInterfaces = [];
			for (const userInterface of this.state.allUserInterfaces) {
				try {
					const loadedClass = userInterfaces[userInterface];
					const loadedClassInstance = new loadedClass(selectedWindowClassInstance.state.identityString);
					if (await loadedClassInstance.validate(selectedWindowClassInstance.state.identityString, selectedWindowClassInstance.props) === true) {
						availableUserInterfaces.push(userInterface);
					}
				} catch (debugError) {
					// Enable this for debugging purposes
					// console.log(debugError);
				}
			}
		}
		
		return availableUserInterfaces;
	}
	
	render () {
		const ref = React.createRef();
		return (<span>
			{/*<span style={{
				zIndex: 256, 
				position: "absolute", 
				top: "0px", 
				right: "0px"
			}}><ReactAsyncDevTools/></span>*/}
			
			{(this.state.selectedWindow === null) ? (<>
				User Interface: <select/><br/>
				Low-Level Mode: <select/><br/>
				<button>(Add)</button>&nbsp;
				<button>(Load)</button>&nbsp;
				<button>(Save)</button>&nbsp;
				<button>(Remove)</button>&nbsp;
				<button>(Validate)</button><br/>
			</>) : (<>
				User Interface: <select value={this.state.selectedUserInterface} onFocus={event => {
					(async () => this.setState({
						availableUserInterfaces: await this.getAvailableUserInterfaces()
					}))();
				}} onChange={event => {
					this.setState({selectedUserInterface: event.target.value});
					window.renderFunction();
				}}>
					{this.state.allUserInterfaces.map(userInterface => {
						if (this.state.availableUserInterfaces.indexOf(userInterface) === -1) {
							return (<option key={userInterface} style={{
								color: "#0000FF"
							}}>{userInterface}</option>);
						} else {
							return (<option key={userInterface}>{userInterface}</option>);
						}
					})}
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
			
			<SSWindow identityString={new URLSearchParams(window.location.search).get("key")} key="root" windowString="root" selectedWindow={this.state.selectedWindow} setSelectedWindow={this.setSelectedWindow} setSelectedWindowWithRef={this.setSelectedWindow("root", ref)} ref={ref}/><br/><br/>
			
			Documentations: <button onClick={() => window.open("/resources/documentations.html", "_blank")}>(View)</button><br/>
			
			Editor Actions: <button onClick={() => {
				this.setState(
					{
						selectedWindow: null, 
						selectedWindowClassInstance: null, 
						selectedUserInterface: null, 
						selectedLowLevelMode: false, 
						availableUserInterfaces: []
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