import SSItem from "../../SSItem.jsx";
import SSHead from "../../SSHead.js";

import * as elements from "../../Elements/All.js";
import * as identifier from "../../../scripts/identifier.js";
import * as listener from "../../../scripts/listener.js";

import * as React from "react";

export default class SSLink {
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
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`link_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== this.identityString) return;
					
					this.state.item = await head.get();
					if (await this.validate(this.identityString, props) !== true) {
						console.log("Invalid SSLink item: ", this.state.item);
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
					const SSButton = elements["SSButton"];
					
					print(<span key={`${props.windowString}_user_interface`}>
						{"uuid" === headAttribute ? <>
							<SSThis table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
							
							{SSItem.itemAddRemove(renderState)}
						</> : <>
							<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_uuid"} elementValue={renderState.item["_uuid"]} red={SSItem.isRed(renderState)}/>
						</>}:{"\u00a0"}
						
						{"start" === headAttribute ? <>
							<SSThis table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
							
							{SSItem.itemAddRemove(renderState)}
						</> : <>
							<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_start"} elementValue={renderState.item["_start"]} red={SSItem.isRed(renderState)}/>
						</>}{"\u00a0"}
						
						<SSButton table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_direction"} elementValue={renderState.item["_direction"]} red={SSItem.isRed(renderState)}/>{"\u00a0"}
						
						{"end" === headAttribute ? <>
							<SSThis table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} red={SSItem.isRed(renderState)}/>
							
							{SSItem.itemAddRemove(renderState)}
						</> : <>
							<SSKey table={this.state.item._table} headAttribute={headAttribute} id={this.identityString} elementAttribute={"_end"} elementValue={renderState.item["_end"]} red={SSItem.isRed(renderState)}/>
						</>}
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
		if (props.defaultUserInterface !== "SSLink") return false;
		if (typeof identityString === "undefined") identityString = this.identityString;
		return new Promise(async resolve => {
			await new SSHead(props.parentIdentityString).forEachRelationshipOf([`link_${props.headAttribute}`], async heads => {
				await heads.forEachAsync(async head => {
					if (head.identityString !== identityString) return;
					
					const item = await head.get();
					if (typeof item === "undefined") throw `Item not loaded: ["link", "${identityString}"]`;
					resolve(SSItem.isSSLink(item));
				});
			});
		});
	}
}