import * as userInterfaces from "./UserInterfaces/All.js";
import * as React from "react";
import Async from "react-async";

export default class SSWindow extends React.Component {
	constructor (props) {
		super(props);
		
		this.state = {
			defaultUserInterface: props.defaultUserInterface ? props.defaultUserInterface : null, 
			loadAsUserInterface: props.loadAsUserInterface ? props.loadAsUserInterface : null, 
			identityString: props.identityString, 
			userInterfaces: ["SSAliase", "SSEditor", "SSObject", "SSGroup", "SSLink", "SSProperty"], 
			userInterfaceClass: null, 
			userInterface: null, 
			lowLevelMode: false, 
			isSelectedWindow: false
		};
	}
	
	/*
	
	According to the official React documentation, to properly set up an error boundary, we also need a getDerivedStateFromError static method (which updates the state of the SSWindow) besides this componentDidCatch method. However, without also writing a fallback UI to replace the current UI that generated the error, after updating the state of the SSWindow, the current UI will just generate the same error again, resulting in an infinite loop. Therefore, we did not write a getDerivedStateFromError static method
	
	*/
	componentDidCatch (errorString, errorObject) {
		console.log(errorString, errorObject);
	}
	
	async addUserInterface (selectedUserInterface) {
		for (const userInterface of this.state.userInterfaces) {
			if (userInterface !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[userInterface];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString, this.props) === false) {
				await loadedClassInstance.add();
				console.log("User interface added");
			} else {
				throw "User interface already added";
			}
		}
	}
	
	async loadUserInterface (selectedUserInterface) {
		this.setState({loadAsUserInterface: selectedUserInterface});
		if (selectedUserInterface === null) throw "User interface invalid";
	}
	
	async saveUserInterface (selectedUserInterface) {
		for (const userInterface of this.state.userInterfaces) {
			if (userInterface !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[userInterface];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString, this.props) === true) {
				await loadedClassInstance.save();
				console.log("User interface saved");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	async removeUserInterface (selectedUserInterface) {
		for (const userInterface of this.state.userInterfaces) {
			if (userInterface !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[userInterface];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString, this.props) === true) {
				await loadedClassInstance.remove();
				console.log("User interface removed");
			} else {
				throw "User interface already removed";
			}
		}
	}
	
	async validateUserInterface (selectedUserInterface) {
		for (const userInterface of this.state.userInterfaces) {
			if (userInterface !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[userInterface];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString, this.props) === true) {
				console.log("User interface valid");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	render () {
		return (<Async promiseFn={async () => {
			/*
			
			When the load functions are called in the code below, this.props will be passed as an argument so that the item class instance can access the headAttribute prop through the action argument. This is important because without access to headAttribute, SSGroups will not know whether to render in its "group_parent" form or its "group_uuid" form
			
			*/
			if (this.state.defaultUserInterface === null && this.state.loadAsUserInterface === null) {
				for (const userInterface of this.state.userInterfaces) {
					const loadedClass = userInterfaces[userInterface];
					let loadedClassInstance = new loadedClass(this.state.identityString);
					if (await loadedClassInstance.validate(this.state.identityString, this.props) === true) {
						if ((this.state.userInterface !== userInterface) || (this.state.userInterface === null)) {
							this.state.userInterface = userInterface;
							this.state.userInterfaceClass = loadedClassInstance;
						} else {
							loadedClassInstance = this.state.userInterfaceClass;
						}
						
						return await loadedClassInstance.load(this.props);
					} else {
						continue;
					}
				}
			} else {
				/*
				
				The defaultUserInterface is decided by the user interface class instance that rendered this window, while the loadAsUserInterface is decided by the user through the user interface dropdown menu. If there is a loadAsUserInterface, it overrides the defaultUserInterface, except if it is not a valid user interface for the current window, it would be reset to null so that the defaultUserInterface can take over the current window
				
				*/
				let loadAsUserInterface = this.state.defaultUserInterface;
				if (this.state.loadAsUserInterface !== null) loadAsUserInterface = this.state.loadAsUserInterface;
				
				const loadedClass = userInterfaces[loadAsUserInterface];
				let loadedClassInstance = new loadedClass(this.state.identityString);
				if (await loadedClassInstance.validate(this.state.identityString, this.props) === true) {
					if ((this.state.userInterface !== loadAsUserInterface) || (this.state.userInterface === null)) {
						this.state.userInterface = loadAsUserInterface;
						this.state.userInterfaceClass = loadedClassInstance;
					} else {
						loadedClassInstance = this.state.userInterfaceClass;
					}
					
					return await loadedClassInstance.load(this.props);
				} else {
					this.loadUserInterface(null);
				}
			}
		}}>
			{({data, error, isPending}) => {
				if (isPending && typeof data === "undefined") return "Loading... ";
				if (error) throw "SSWindow render failed: " + error;
				if (data) {
					return (<span style={{
						border: "1px solid #000000", 
						display: "inline-block", 
						verticalAlign: "top", 
						position: "relative", 
						top: "-1px"
					}}>
						<div style={{
							backgroundColor: ((this.props.windowString === this.props.selectedWindow) ? "#FF0000" : "#0000FF"), 
							borderBottom: "1px solid #000000", 
							width: "100%", 
							height: "20px"
						}}>
							<span style={{
								color: "#FFFFFF", 
								position: "relative", 
								top: "1px"
							}}>{this.state.userInterface}</span>{"\u00a0"}
							
							<button style={{
								float: "right"
							}} onClick={() => this.props.setSelectedWindowWithRef()}>(#)</button>
						</div>
						
						<span style={{
							verticalAlign: "top", 
							position: "relative", 
							top: "1px"
						}}>{data}</span>
					</span>);
				}
			}}
		</Async>);
	}
}