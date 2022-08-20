import * as userInterfaces from "./UserInterfaces/All.js";
import * as React from "react";
import Async from "react-async";

export default class SSWindow extends React.Component {
	constructor (props) {
		super(props);
		
		this.state = {
			loadAs: props.loadAs ? props.loadAs : null, 
			identityString: props.identityString, 
			userInterfaceKeys: ["SSAliase", "SSEditor", "SSObject", "SSGroup", "SSLink", "SSProperty"], 
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
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString) === false) {
				await loadedClassInstance.add();
				console.log("User interface added");
			} else {
				throw "User interface already added";
			}
		}
	}
	
	async loadUserInterface (selectedUserInterface) {
		this.setState({loadAs: selectedUserInterface});
	}
	
	async saveUserInterface (selectedUserInterface) {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString) === true) {
				await loadedClassInstance.save();
				console.log("User interface saved");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	async removeUserInterface (selectedUserInterface) {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString) === true) {
				await loadedClassInstance.remove();
				console.log("User interface removed");
			} else {
				throw "User interface already removed";
			}
		}
	}
	
	async validateUserInterface (selectedUserInterface) {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== selectedUserInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.identityString);
			if (await loadedClassInstance.validate(this.state.identityString) === true) {
				console.log("User interface valid");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	render () {
		return (<Async promiseFn={async () => {
			/*
			
			When the load functions are called in the code below, this.props will be passed as an argument so that the item class instance can access the templateThis prop through the action argument. This is important because without access to templateThis, SSGroups will not know whether to render in its "group_parent" form or its "group_uuid" form
			
			*/
			if (this.state.loadAs === null) {
				for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
					const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
					let loadedClassInstance = new loadedClass(this.state.identityString);
					if (await loadedClassInstance.validate(this.state.identityString) === true) {
						if ((this.state.userInterface !== this.state.userInterfaceKeys[i]) || (this.state.userInterface === null)) {
							this.state.userInterface = this.state.userInterfaceKeys[i];
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
				const loadedClass = userInterfaces[this.state.loadAs];
				let loadedClassInstance = new loadedClass(this.state.identityString);
				if (await loadedClassInstance.validate(this.state.identityString) === true) {
					if ((this.state.userInterface !== this.state.loadAs) || (this.state.userInterface === null)) {
						this.state.userInterface = this.state.loadAs;
						this.state.userInterfaceClass = loadedClassInstance;
					} else {
						loadedClassInstance = this.state.userInterfaceClass;
					}
					
					return await loadedClassInstance.load(this.props);
				} else {
					this.setState({loadAs: null});
					throw "User interface invalid";
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
							position: "relative", 
							top: "1px"
						}}>{data}</span>
					</span>);
				}
			}}
		</Async>);
	}
}