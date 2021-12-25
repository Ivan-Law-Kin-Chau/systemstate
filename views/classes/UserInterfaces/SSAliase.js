import SSExpander from "../SSExpander.js";

import * as items from "../Items/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as validator from "../../scripts/validator.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

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
		var dependencies = await this.expander.expand(this.uuid);
		if (dependencies["property_parent"]) {
			for (let uuid of dependencies["property_parent"]) {
				await this.assembly.getState("property", {
					_uuid: uuid
				});
				
				const item = this.assembly.state.property[uuid];
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						this.state.uuid = item._uuid;
						this.loaded = true;
						return true;
					}
				}
			}
		}
		
		return false;
	}
	
	async load (action = {}) {
		if (this.loaded === true) {
			return html`<span onclick=${() => {
				window.listener.dispatch({
					"type": "OPEN", 
					"key": this.state.uuid
				})
			}}>[aliase]</span>`;
		} else {
			console.log("User interface class not yet initiated properly! Call the add() method first");
			return html``;
		}
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
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