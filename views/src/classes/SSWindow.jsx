import * as userInterfaces from "./UserInterfaces/All.js";
import * as React from "react";
import Async from "react-async";

export default class SSWindow extends React.Component {
	constructor (props) {
		super(props);
		this.selected = {
			userInterface: null, 
			lowLevelMode: false
		};
		
		this.state = {
			loadAs: props.loadAs ? props.loadAs : null, 
			uuid: props.uuid, 
			userInterfaceKeys: ["SSAliase", "SSEditor", "SSObject", "SSGroup", "SSLink", "SSProperty"], 
			userInterfaceClass: null, 
			userInterface: null, 
			currentLowLevelMode: false
		};
	}
	
	async addUserInterface () {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== this.selected.userInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
			if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === false) {
				await loadedClassInstance.add();
				console.log("User interface added");
			} else {
				throw "User interface already added";
			}
		}
	}
	
	async loadUserInterface () {
		this.setState({loadAs: this.selected.userInterface});
	}
	
	async saveUserInterface () {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== this.selected.userInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
			if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === true) {
				await loadedClassInstance.save();
				console.log("User interface saved");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	async removeUserInterface () {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== this.selected.userInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
			if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === true) {
				await loadedClassInstance.remove();
				console.log("User interface removed");
			} else {
				throw "User interface already removed";
			}
		}
	}
	
	async validateUserInterface () {
		for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
			if (this.state.userInterfaceKeys[i] !== this.selected.userInterface) continue;
			const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
			const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
			if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === true) {
				console.log("User interface valid");
			} else {
				throw "User interface invalid";
			}
		}
	}
	
	render () {
		return (<Async promiseFn={async () => {
			if (this.state.loadAs === null) {
				for (let i = 0; i < this.state.userInterfaceKeys.length; i++) {
					const loadedClass = userInterfaces[this.state.userInterfaceKeys[i]];
					const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
					if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === true) {
						if (this.props.isRoot === true) window.selected.rootUuid = this.state.uuid;
						this.state.userInterface = this.state.userInterfaceKeys[i];
						this.state.userInterfaceClass = loadedClassInstance;
						this.selected.userInterface = this.state.userInterfaceKeys[i];
						this.selected.userInterfaceClass = loadedClassInstance;
						return await loadedClassInstance.load(this.props);
					} else {
						continue;
					}
				}
			} else {
				const loadedClass = userInterfaces[this.state.loadAs];
				const loadedClassInstance = new loadedClass(this.state.uuid, window.assembly, window.selected, window.listener);
				if (await loadedClassInstance.validate(window.assembly, this.state.uuid) === true) {
					if (this.props.isRoot === true) window.selected.rootUuid = this.state.uuid;
					this.state.userInterface = this.state.loadAs;
					this.state.userInterfaceClass = loadedClassInstance;
					this.selected.userInterface = this.state.loadAs;
					this.selected.userInterfaceClass = loadedClassInstance;
					return await loadedClassInstance.load(this.props);
				} else {
					console.error("User interface invalid");
					this.setState({loadAs: null});
				}
			}
		}}>
			{({data, error, isPending}) => {
				if (isPending) return "Loading... ";
				if (data) return (<span style={{
					border: "1px solid #000000", 
					display: "inline-block", 
					position: "relative", 
					top: "-1px"
				}}>
					<div style={{
						backgroundColor: "#0000FF", 
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
						}}>(#)</button>
					</div>
					
					<span style={{
						position: "relative", 
						top: "1px"
					}}>{data}</span>
				</span>);
			}}
		</Async>);
	}
}