import Aliase from "./Aliase.jsx";

import SSExpander from "../../SSExpander.js";

import * as convertor from "../../../scripts/convertor.js";
import * as validator from "../../../scripts/validator.js";
import * as generator from "../../../scripts/generator.js";

import * as React from "react";

export const SSUserInterface = React.createContext();

export default class SSAliase {
	constructor (uuid, assembly, selected, listener) {
		// The head UUID of the class instance
		this.uuid = uuid;
		
		this.assembly = assembly;
		this.selected = selected;
		this.listener = listener;
		this.expander = new SSExpander(this.assembly);
		this.state = {};
		this.loaded = false;
	}
	
	async add (action = {}) {
		return await this.assembly.set("property", {
			_uuid: {generateKeyCode: 1}, 
			_parent: this.uuid, 
			_name: "Target", 
			_content: {generateKeyCode: 2}, 
			_add: true
		});
	}
	
	async load (action = {}) {
		let content;
		const classInstance = this;
		if (await (async function () {
			var dependencies = await classInstance.expander.expand(classInstance.uuid, classInstance.state !== {});
			if (dependencies["property_parent"]) {
				for (let identity of dependencies["property_parent"]) {
					const item = await classInstance.assembly.get("property", identity);
					if (item._success === true && item._name === "Target") {
						if (validator.isValidKey(item._content) === true) {
							content = item._content;
							classInstance.state.uuid = item._uuid;
							classInstance.loaded = true;
							return true;
						}
					}
				}
			}
			
			return false;
		})() === true) {
			return (<SSUserInterface.Provider value={action => this.listener.dispatch(action)}>
				<Aliase source={this.state.uuid} target={content} save={this.save.bind(this)}/>
			</SSUserInterface.Provider>);
		} else {
			console.log("User interface class not yet initiated properly! Call the add() method first");
			return "";
		}
	}
	
	async save (action = {}) {
		var dependencies = await this.expander.expand(this.uuid);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", identity);
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(action.target) === true) {
						await this.assembly.set("property", {
							_uuid: item._uuid, 
							_parent: this.uuid, 
							_name: "Target", 
							_content: action.target
						});
					}
				}
			}
		}
		
		return true;
	}
	
	async remove (action = {}) {
		var dependencies = await this.expander.expand(this.uuid);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", identity);
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						await this.assembly.set("property", {
							_uuid: item._uuid, 
							_remove: true
						});
					}
				}
			}
		}
		
		return true;
	}
	
	async validate (assembly, uuid) {
		var dependencies = await this.expander.expand(uuid);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", identity);
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						return true;
					}
				}
			}
		}
		
		return false;
	}
}