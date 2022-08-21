import Aliase from "./Aliase.jsx";

import SSExpander from "../../SSExpander.js";
import SSListener from "../../SSListener.js";

import * as convertor from "../../../scripts/convertor.js";
import * as validator from "../../../scripts/validator.js";
import * as generator from "../../../scripts/generator.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export const SSEditorContext = React.createContext();

export default class SSAliase {
	constructor (identityString) {
		// The head identity string of the class instance
		identifier.assertIdentityStringLength(8, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return await window.assembly.set("property", {
			_uuid: {generateKeyCode: 1}, 
			_parent: this.identityString, 
			_name: "Target", 
			_content: {generateKeyCode: 2}, 
			_add: true
		});
	}
	
	async load (action = {}) {
		let content;
		const classInstance = this;
		if (await (async function () {
			var dependencies = await SSExpander.expand(classInstance.identityString);
			if (dependencies["property_parent"]) {
				for (let identity of dependencies["property_parent"]) {
					const item = await window.assembly.get("property", identity);
					if (item._success === true && item._name === "Target") {
						if (validator.isValidKey(item._content) === true) {
							content = item._content;
							classInstance.state.identityString = item._uuid;
							return true;
						}
					}
				}
			}
			
			return false;
		})() === true) {
			return (<SSEditorContext.Provider value={action => SSListener.dispatch(action)}>
				<Aliase source={this.state.identityString} target={content} save={this.save.bind(this)}/>
			</SSEditorContext.Provider>);
		} else {
			console.log("User interface not yet initiated properly! Call the add() method first");
			return "";
		}
	}
	
	async save (action = {}) {
		var dependencies = await SSExpander.expand(this.identityString);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await window.assembly.get("property", identity);
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(action.target) === true) {
						await window.assembly.set("property", {
							_uuid: item._uuid, 
							_parent: this.identityString, 
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
		var dependencies = await SSExpander.expand(this.identityString);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await window.assembly.get("property", identity);
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						await window.assembly.set("property", {
							_uuid: item._uuid, 
							_remove: true
						});
					}
				}
			}
		}
		
		return true;
	}
	
	async validate (identityString, action = {}) {
		var dependencies = await SSExpander.expand(identityString);
		if (dependencies["property_parent"]) {
			for (let identity of dependencies["property_parent"]) {
				const item = await window.assembly.get("property", identity);
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