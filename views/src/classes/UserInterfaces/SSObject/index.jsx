import SSItem from "../../SSItem.jsx";
import SSHead from "../../SSHead.js";

import * as elements from "../../Elements/All.js";
import * as validator from "../../../scripts/validator.js";
import * as identifier from "../../../scripts/identifier.js";
import * as listener from "../../../scripts/listener.js";

import * as React from "react";

export default class SSObject {
	constructor (identityString) {
		// The head identity string of the user interface
		identifier.assertIdentityStringLength(8, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		return await listener.listen(async print => {
			await new SSHead(this.identityString).forEachTypeOf(["object_uuid"], async (array, heads, parentHead, state) => {
				await heads.forEachAsync(async head => {
					this.state.item = await head.get();
					if (await this.validate(this.identityString, action) !== true) {
						console.log("Invalid SSObject item: ", this.state.item);
					}
					
					var headAttribute = action.headAttribute ? action.headAttribute : null;
					var renderState = {
						item: this.state.item, 
						identityString: this.identityString, 
						selectedObject: action.selectedObject, 
						headAttribute: headAttribute
					};
					
					const SSSelector = elements["SSSelector"];
					const SSKey = elements["SSKey"];
					
					print(<>
						<SSSelector type={this.state.item._type} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
						
						<SSKey type={this.state.item._type} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_" + headAttribute} elementValue={this.state.item["_" + headAttribute]} red={SSItem.isRed(renderState)}/>
						
						{SSItem.itemAddRemove(renderState)}{"\u00a0"}this
					</>);
				});
			}, false);
		});
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
		return true;
	}
	
	async validate (identityString, action = {}) {
		if (!SSItem.isSSItem(action)) return false;
		if (action.defaultUserInterface !== "SSObject") return false;
		if (typeof identityString === "undefined") identityString = this.identityString;
		const item = window.assembly.state["object"][identityString];
		if (typeof item === "undefined") throw `Item not loaded: ["object", "${identityString}"]`;
		return SSObject.validateItem(item);
	}
	
	// This is separate from the validate function since SSAssembly has to validate items that is not in the SSAssembly state yet
	static validateItem (item) {
		if (item._type !== "object") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		return true;
	}
}