import SSKey from "../../Elements/SSKey.jsx";

import SSListener from "../../SSListener.js";
import SSHead from "../../SSHead.js";

import * as convertor from "../../../scripts/convertor.js";
import * as validator from "../../../scripts/validator.js";
import * as generator from "../../../scripts/generator.js";
import * as identifier from "../../../scripts/identifier.js";
import * as listener from "../../../scripts/listener.js";

import * as React from "react";

export const SSEditorContext = React.createContext();

export default class SSAliase {
	constructor (identityString) {
		// The head identity string of the user interface
		identifier.assertIdentityStringLength(8, identityString);
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (props = {}) {
		await new SSHead(this.identityString).forEachRelationshipOf(["property_parent"], async heads => {
			await heads.pushHead({generateKeyCode: 1}, async head => {
				await head.set({
					_uuid: head.identityString, 
					_parent: this.identityString, 
					_name: "Target", 
					_content: {generateKeyCode: 2}, 
					_add: true
				});
			});
		});
	}
	
	dispatch (action) {
		if (action.type === "OPEN") {
			SSListener.dispatch(null, action);
		} else if (action.type === "SAVE") {
			console.log({
				type: "CUSTOM_SAVE", 
				userInterface: "SSAliase", 
				target: action.value
			});
			
			this.state.target = action.value;
		}
	}
	
	onClick () {
		SSListener.dispatch(null, {
			"type": "OPEN", 
			"key": this.state.target, 
			"bypassShiftPressedCheck": true
		});
	}
	
	async load (props = {}) {
		return await listener.listen(async print => {
			let notInstantiated = true;
			await new SSHead(this.identityString).forEachRelationshipOf(["property_parent"], async heads => {
				await heads.forEachAsync(async head => {
					const item = await head.get();
					if (item._success === true && item._name === "Target") {
						if (validator.isValidKey(item._content) === true) {
							this.state.target = item._content;
							print(<span key={`${props.windowString}_user_interface`}>
								<SSKey id={item._uuid} elementValue={this.state.target} dispatch={this.dispatch.bind(this)}/> <button onClick={this.onClick.bind(this)}>(Aliase)</button>
							</span>);
							notInstantiated = false;
						}
					}
				});
			});
			
			if (notInstantiated === true) {
				console.log("User interface not yet instantiated properly! Call the add() method first");
			}
		});
	}
	
	async save (props = {}) {
		await new SSHead(this.identityString).forEachRelationshipOf(["property_parent"], async heads => {
			await heads.forEachAsync(async head => {
				const item = await head.get();
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(this.state.target) === true) {
						await head.set({_content: this.state.target});
					}
				}
			});
		});
		
		return true;
	}
	
	async remove (props = {}) {
		await new SSHead(this.identityString).forEachRelationshipOf(["property_parent"], async heads => {
			await heads.forEachAsync(async head => {
				const item = await head.get();
				if (item._success === true && item._name === "Target") {
					if (validator.isValidKey(item._content) === true) {
						await head.set({_remove: true});
					}
				}
			});
		});
		
		return true;
	}
	
	async validate (identityString, props = {}) {
		return new Promise(async resolve => {
			await new SSHead(identityString).forEachRelationshipOf(["property_parent"], async heads => {
				await heads.forEachAsync(async head => {
					const item = await head.get();
					if (item._success === true && item._name === "Target") {
						if (validator.isValidKey(item._content) === true) {
							resolve(true);
						}
					}
				});
			});
			
			resolve(false);
		});
	}
}