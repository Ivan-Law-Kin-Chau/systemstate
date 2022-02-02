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
		const key1 = generator.generateKey();
		const key2 = generator.generateKey();
		return await this.assembly.setState("property", {
			_uuid: key1
		}, {
			_uuid: key1, 
			_parent: this.uuid, 
			_name: "Target", 
			_content: key2
		});
	}
	
	async load (action = {}) {
		const classInstance = this;
		if (await (async function () {
			var dependencies = await classInstance.expander.expand(classInstance.uuid);
			if (dependencies["property_parent"]) {
				for (let uuid of dependencies["property_parent"]) {
					await classInstance.assembly.getState("property", {
						_uuid: uuid
					});
					
					const item = classInstance.assembly.state.property[uuid];
					if (item._success === true && item._name === "Target") {
						if (validator.isValidKey(item._content) === true) {
							classInstance.state.uuid = item._uuid;
							classInstance.loaded = true;
							return true;
						}
					}
				}
			}
			
			return false;
		})() === true) {
			return html`<${Aliase} target=${this.state.uuid} save=${this.save}/>`;
		} else {
			console.log("User interface class not yet initiated properly! Call the add() method first");
			return html``;
		}
	}
	
	async save (action = {}) {
		console.log(action);
		return true;
	}
	
	async remove (action = {}) {
		var dependencies = await this.expander.expand(this.uuid);
		if (dependencies["property_parent"]) {
			for (let uuid of dependencies["property_parent"]) {
				await this.assembly.getState("property", {
					_uuid: uuid
				});
				
				const item = this.assembly.state.property[uuid];
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						await this.assembly.setState("property", {
							_uuid: uuid
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
				await this.assembly.getState("property", {
					_uuid: uuid
				});
				
				const item = this.assembly.state.property[uuid];
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