import SSPackaging from "../SSPackaging.js";

import * as items from "../Items/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as validator from "../../scripts/validator.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSAlliase {
	constructor (uuid, assembly) {
		// The head UUID of the class instance
		this.uuid = uuid;
		
		this.assembly = assembly;
		this.packaging = new SSPackaging(this.assembly.send);
		this.state = {};
		this.loaded = false;
	}
	
	async add (action = {}) {
		for (let i = 0; i < this.assembly.state.property.length; i++) {
			if (this.assembly.state.property[i]._uuid === this.uuid) {
				var uuid = (await this.assembly.send(`search("uuid", "${this.uuid}", "property")`))._uuid[0];
				this.loaded = true;
				return true;
			}
		}
		
		return false;
	}
	
	async load (action = {}) {
		if (this.loaded === true) {
			return html`<span onclick=${() => {
				window.listener.dispatch({
					"type": "OPEN", 
					"key": this.uuid
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
		return true;
	}
}