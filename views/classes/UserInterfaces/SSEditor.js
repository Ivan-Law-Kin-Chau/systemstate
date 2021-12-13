import SSPackaging from "../SSPackaging.js";

import * as items from "../Items/All.js";
import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSEditor {
	constructor (uuid, send, assembly) {
		// The head UUID of the Editor class instance
		this.uuid = uuid;
		
		this.send = send;
		this.assembly = assembly;
		this.packaging = new SSPackaging(send);
		this.state = {};
	}
	
	async add (action = {}) {
		// First, get the dependencies of the editor with the UUID as the editor's head
		var dependencies = await this.packaging.check(this.uuid);
		
		// Then, for each dependency, load the element that corresponds to it
		for (let array in dependencies) {
			this.state[array] = [];
			for (let item of dependencies[array]) {
				const type = array.split("_")[0];
				if (array === "group_uuid") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: this.uuid, 
							_parent: item
						})
					);
				} else if (array === "group_parent") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item, 
							_parent: this.uuid
						})
					);
				} else {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item
						})
					);
				}
			}
		}
		
		this.dependenciesLoaded = true;
		return this.assembly;
	}
	
	async load (action = {}) {
		if (await this.validate(this.assembly, this.uuid) === true) {
			let orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
			let renderOutput = [];
			
			for (var i = 0; i < orderOfArrays.length; i++) {
				const array = orderOfArrays[i];
				if (!(this.state[array])) continue;
				let arrayOutput = [];
				
				for (let index = 0; index < this.state[array].length; index++) {
					let templateType = array.split("_")[0];
					let templateThis = array.split("_")[1];
					
					if (templateType === "group") {
						if (templateThis === "uuid") {
							templateThis = "parent";
						} else if (templateThis === "parent") {
							templateThis = "uuid";
						}
					}
					
					const type = this.state[array][index][0];
					const identityString = this.state[array][index][1];
					
					if (array === "group_uuid" && arrayOutput !== []) {
						arrayOutput.push(": ");
					}
					
					if (array.split("_")[0] === "link" || array.split("_")[0] === "property") arrayOutput.push(html`<br/>`);
					
					arrayOutput.push(html`<${items[convertor.convertCamelCaseToSS(type)]} identityString=${identityString} templateThis=${templateThis} assembly=${this.assembly}/>`);
					
					if ((array === "group_uuid" || array === "object_uuid" || array === "group_parent") && index + 1 < this.state[array].length) arrayOutput.push(", ");
					
					if (array === "group_parent" && arrayOutput !== []) {
						arrayOutput.push(": ");
					}
				}
				
				renderOutput = [...renderOutput, ...arrayOutput];
			}
			
			return renderOutput;
		}
	}
	
	async save (action = {}) {
		return this.assembly;
	}
	
	async remove (action = {}) {
		return this.assembly;
	}
	
	async validate (assembly, uuid) {
		return true;
	}
}