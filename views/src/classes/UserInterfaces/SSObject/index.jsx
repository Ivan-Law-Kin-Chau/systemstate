import SSItem from "../../SSItem.jsx";
import SSHead from "../../SSHead.js";

import * as elements from "../../Elements/All.js";
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
	
	async add (props = {}) {
		return true;
	}
	
	async load (props = {}) {
		return await listener.listen(async print => {
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`object_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== this.identityString) return;
					
					this.state.item = await head.get();
					if (await this.validate(this.identityString, props) !== true) {
						console.log("Invalid SSObject item: ", this.state.item);
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
						
						{SSItem.itemAddRemove(renderState)}{"\u00a0"}this
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
		if (props.defaultUserInterface !== "SSObject") return false;
		if (typeof identityString === "undefined") identityString = this.identityString;
		return new Promise(async resolve => {
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`object_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== identityString) return;
					
					const item = await head.get();
					if (typeof item === "undefined") throw `Item not loaded: ["object", "${identityString}"]`;
					resolve(SSItem.isSSObject(item));
				});
			});
		});
	}
}