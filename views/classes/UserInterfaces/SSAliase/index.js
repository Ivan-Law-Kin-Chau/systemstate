import Aliase from "./Aliase.js";

import SSExpander from "../../SSExpander.js";

import * as items from "../../Items/All.js";
import * as convertor from "../../../scripts/convertor.js";
import * as validator from "../../../scripts/validator.js";
import * as generator from "../../../scripts/generator.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSAliase {
	constructor (uuid, assembly) {
		// The head UUID of the class instance
		this.uuid = uuid;
		
		this.assembly = assembly;
		this.expander = new SSExpander(this.assembly.sender);
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
			var dependencies = await classInstance.expander.expand(classInstance.uuid);
			if (dependencies["property_parent"]) {
				for (let uuid of dependencies["property_parent"]) {
					const item = await classInstance.assembly.get("property", {_uuid: uuid});
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
			return html`<${Aliase} source=${this.state.uuid} target=${content} save=${this.save.bind(this)}/>`;
		} else {
			console.log("User interface class not yet initiated properly! Call the add() method first");
			return html``;
		}
	}
	
	async save (action = {}) {
		var dependencies = await this.expander.expand(this.uuid);
		if (dependencies["property_parent"]) {
			for (let uuid of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", {_uuid: uuid});
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(action.target) === true) {
						await this.assembly.set("property", {
							_uuid: uuid, 
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
			for (let uuid of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", {_uuid: uuid});
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						await this.assembly.set("property", {
							_uuid: uuid, 
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
			for (let uuid of dependencies["property_parent"]) {
				const item = await this.assembly.get("property", {_uuid: uuid});
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