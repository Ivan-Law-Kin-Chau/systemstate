import * as identifier from "../scripts/identifier.js";

import SSExpander from "./SSExpander.js";

export default class SSHead {
	constructor (identityString, parentHead = null) {
		this.identityString = identityString;
		this.parentHead = parentHead;
	}
	
	async #loopThroughTypes (callbackFunction) {
		// A place that the chained functions can read/write if they need to keep track of state
		let state = {};
		
		for (const type in this.types) {
			for (let relationship in this.types[type]) {
				const identityString = identifier.identityToString(type.split("_")[0], this.types[type][relationship]);
				this.types[type][relationship] = new SSHead(identityString, this);
			}
			
			this.types[type].forEachAsync = async function (callbackFunction, parentHead) {
				if (typeof callbackFunction !== "function") {
					throw new TypeError(callbackFunction + " is not a function");
				}
				
				let array = this;
				parentHead = parentHead || this;
				for (let i = 0; i < array.length; i++) {
					await callbackFunction.call(parentHead, array[i], i, array);
				}
			}
			
			
			const parentHead = this;
			this.types[type].pushHead = async function (identityString, callbackFunction = null) {
				if (typeof identityString === "object") {
					identityString = identifier.identityToString(type, await window.assembly.generateKeys({_uuid: identityString}));
				}
				
				let array = this;
				array.push(new SSHead(identityString, parentHead));
				
				if (typeof callbackFunction === "function") {
					await callbackFunction.call(this, array[array.length - 1]);
				}
				
			}
			
			this.tempType = type;
			await callbackFunction(type, this.types[type], this, state);
		}
		
		delete this.tempType;
	}
	
	async forEachType (callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.types = await SSExpander.expand(this.identityString, sendSearches);
		await this.#loopThroughTypes(callbackFunction);
	}
	
	async forEachTypeOf (searchArrays, callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.types = await SSExpander.expand(this.identityString, sendSearches, searchArrays);
		await this.#loopThroughTypes(callbackFunction);
	}
	
	async get () {
		let type = this.parentHead.tempType.split("_")[0];
		let identity = identifier.identityFromString(type, this.identityString);
		let item = await window.assembly.getState(type, identity);
		return window.assembly.state[type][identifier.identityToString(type, identity)];
	}
	
	async set (item) {
		let type = this.parentHead.tempType.split("_")[0];
		let identity = identifier.identityFromString(type, this.identityString);
		item = await window.assembly.generateKeys(item, type === "object");
		await window.assembly.setState(type, identity, item);
	}
}