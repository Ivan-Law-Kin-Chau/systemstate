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
				if (data) return (<span>
					User Interface: <select defaultValue={this.state.userInterface} onChange={event => this.selected.userInterface = event.target.value}>
						<option>SSAliase</option>
						<option>SSEditor</option>
						<option>SSObject</option>
						<option>SSGroup</option>
						<option>SSLink</option>
						<option>SSProperty</option>
					</select><br/>
					Low-Level Mode: <select defaultValue={this.state.lowLevelMode} onChange={event => this.selected.lowLevelMode = event.target.value}>
						<option value={null}>Default</option>
						<option value={true}>On</option>
						<option value={false}>Off</option>
					</select><br/>
					<button onClick={this.addUserInterface.bind(this)}>(Add)</button>&nbsp;
					<button onClick={this.loadUserInterface.bind(this)}>(Load)</button>&nbsp;
					<button onClick={this.saveUserInterface.bind(this)}>(Save)</button>&nbsp;
					<button onClick={this.removeUserInterface.bind(this)}>(Remove)</button>&nbsp;
					<button onClick={this.validateUserInterface.bind(this)}>(Validate)</button><br/><br/>
					<div>{data}</div>
				</span>);
			}}
		</Async>);
	}
}