import * as identifier from "../scripts/identifier.js";

export default class SSHead {
	constructor (identityString, parentHead = null) {
		this.identityString = identityString;
		this.parentHead = parentHead;
	}
	
	static async searchForArrays (key, sendSearches, searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"]) {
		let output = [];
		
		/*
		
		Search for items that have the correct relationships with the key either on the server or in the SSSender cache, and then add to the search results those that are not yet on the server or in the SSSender cache, but already in the SSAssembly state. There will not be items that are no longer in the SSAssembly state, but still on the server or in the SSSender cache to remove, so the code to do so will not be written (to know why, read the comment just above the "this.state = {" line in the SSAssembly class)
		
		*/
		for (const array of searchArrays) {
			const type = array.split("_")[0];
			const headAttribute = array.split("_")[1];
			const searchResults = sendSearches === true ? JSON.parse(JSON.stringify((await window.assembly.sender.send("search", `("${headAttribute}", "${key}", "${type}")`))._output)) : [];
			
			let searchArea = window.assembly.state[type];
			for (const identityString in searchArea) {
				const item = searchArea[identityString];
				if (item["_" + headAttribute] === key) {
					let isDuplicate = false;
					for (const identity of searchResults) {
						if (JSON.stringify(identity) === JSON.stringify(identifier.identityFromString(type, identityString))) {
							isDuplicate = true;
						}
					}
					
					if (isDuplicate === false) {
						searchResults.push(identifier.identityFromString(type, identityString));
					}
				}
			}
			
			output.push({
				type: array, 
				relationships: searchResults
			});
		}
		
		return output;
	}
	
	async #loopThroughTypes (callbackFunction) {
		// A place that the chained functions can read/write if they need to keep track of state
		let state = {};
		
		for (let typeObject of this.types) {
			const type = typeObject.type;
			
			for (let relationship in typeObject.relationships) {
				const identityString = identifier.identityToString(type.split("_")[0], typeObject.relationships[relationship]);
				typeObject.relationships[relationship] = new SSHead(identityString, this);
			}
			
			typeObject.relationships.forEachAsync = async function (callbackFunction, parentHead) {
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
			typeObject.relationships.pushHead = async function (identityString, callbackFunction = null) {
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
			await callbackFunction(type, typeObject.relationships, this, state);
		}
		
		delete this.tempType;
	}
	
	async forEachType (callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.types = await SSHead.searchForArrays(this.identityString, sendSearches);
		await this.#loopThroughTypes(callbackFunction);
	}
	
	async forEachTypeOf (searchArrays, callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.types = await SSHead.searchForArrays(this.identityString, sendSearches, searchArrays);
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