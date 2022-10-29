import SSItem from "../../SSItem.jsx";
import SSHead from "../../SSHead.js";

import * as elements from "../../Elements/All.js";
import * as identifier from "../../../scripts/identifier.js";
import * as listener from "../../../scripts/listener.js";

import * as React from "react";

export default class SSProperty {
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
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`property_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== this.identityString) return;
					
					this.state.item = await head.get();
					if (await this.validate(this.identityString, props) === false) {
						console.log("Invalid SSProperty item: ", this.state.item);
					}
					
					var headAttribute = props.headAttribute ? props.headAttribute : null;
					var renderState = {
						item: this.state.item, 
						identityString: this.identityString, 
						selectedObject: props.selectedObject, 
						headAttribute: headAttribute
					};
					
					const SSThis = elements["SSThis"];
					const SSKey = elements["SSKey"];
					const SSInput = elements["SSInput"];
					const SSTextarea = elements["SSTextarea"];
					
					print(<span key={`${props.windowString}_user_interface`}>
						{"uuid" === headAttribute ? <>
							<SSThis table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
							
							{SSItem.itemAddRemove(renderState)}
						</> : <>
							<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_uuid"} elementValue={this.state.item["_uuid"]} red={SSItem.isRed(renderState)}/>
						</>}:{"\u00a0"}
						
						{"parent" === headAttribute ? <>
							<SSThis table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
							
							{SSItem.itemAddRemove(renderState)}
						</> : <>
							<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_parent"} elementValue={this.state.item["_parent"]} red={SSItem.isRed(renderState)}/>
						</>}:{"\u00a0"}
						
						<SSInput table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_name"} elementValue={this.state.item["_name"]} red={SSItem.isRed(renderState)}/>:{"\u00a0"}<br/>
						
						<SSTextarea table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_content"} elementValue={this.state.item["_content"]} red={SSItem.isRed(renderState)}/>
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
		if (props.defaultUserInterface !== "SSProperty") return false;
		if (typeof identityString === "undefined") identityString = this.identityString;
		return new Promise(async resolve => {
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`property_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== identityString) return;
					
					const item = await head.get();
					if (typeof item === "undefined") throw `Item not loaded: ["property", "${identityString}"]`;
					resolve(SSItem.isSSProperty(item));
				});
			});
		});
	}
}