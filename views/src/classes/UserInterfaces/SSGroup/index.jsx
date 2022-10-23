import SSItem from "../../SSItem.jsx";
import SSHead from "../../SSHead.js";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";
import * as listener from "../../../scripts/listener.js";

import * as React from "react";

export default class SSGroup {
	constructor (identityString) {
		// The head identity string of the user interface
		identifier.assertIdentityStringLength(17, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (props = {}) {
		return await listener.listen(async print => {
			if (props.headAttribute === "parent") {
				var key = this.identityString.split("_")[0];
				var relationship = "group_uuid";
			} else if (props.headAttribute === "uuid") {
				var key = this.identityString.split("_")[1];
				var relationship = "group_parent";
			} else {
				throw "Invalid head attribute: " + props.headAttribute;
			}
			
			await new SSHead(key).forEachRelationshipOf([relationship], async heads => {
				await heads.forEachAsync(async head => {
					this.state.item = await head.get();
					if (await this.validate(this.identityString, props) !== true) {
						console.log("Invalid SSGroup item: ", this.state.item);
					}
					
					var headAttribute = props.headAttribute ? props.headAttribute : null;
					var renderState = {
						item: this.state.item, 
						identityString: this.identityString, 
						selectedObject: props.selectedObject, 
						headAttribute: headAttribute
					};
					
					const SSSelector = elements["SSSelector"];
					const SSKey = elements["SSKey"];
					
					print(<span key={`${props.windowString}_user_interface`}>
						<SSSelector table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
						
						<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_" + headAttribute} elementValue={this.state.item["_" + headAttribute]} red={SSItem.isRed(renderState)}/>
						
						{SSItem.itemAddRemove(renderState)}
					</span>);
				});
			}, false);
		});
	}
	
	async save (props = {}) {
		return true;
	}
	
	async remove (props = {}) {
		return true;
	}
	
	async validate (identityString, props = {}) {
		if (!SSItem.isSSItem(props)) return false;
		if (props.defaultUserInterface !== "SSGroup") return false;
		if (typeof identityString === "undefined") identityString = this.identityString;
		const item = window.assembly.state["group"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["group", "${identityString}"]`;
		return SSGroup.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._table !== "group") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		if (!validator.isValidKey(item._parent)) return false;
		return true;
	}
}