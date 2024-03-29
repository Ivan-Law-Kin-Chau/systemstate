import * as identifier from "../scripts/identifier.js";

export default class SSHead {
	constructor (identityString, parentHead = null) {
		this.identityString = identityString;
		this.parentHead = parentHead;
		
		// The default order of relationships to search, and the list of all possible relationships that can be searched. If the #searchForRelationships function tries to search a relationship that is not in this list, throw an error
		this.defaultRelationships = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
	}
	
	async #searchForRelationships (key, sendSearches, relationshipsToSearch = this.defaultRelationships) {
		let output = [];
		
		for (const relationship of relationshipsToSearch) {
			if (this.defaultRelationships.indexOf(relationship) === -1) throw `${relationship} is not a relationship`;
			
			const table = relationship.split("_")[0];
			const headAttribute = relationship.split("_")[1];
			const searchResults = sendSearches === true ? JSON.parse(JSON.stringify((await window.assembly.sender.send("search", `("${headAttribute}", "${key}", "${table}")`))._output)) : [];
			
			let searchArea = window.assembly.state[table];
			for (const identityString in searchArea) {
				const item = searchArea[identityString];
				if (item["_" + headAttribute] === key) {
					let isDuplicate = false;
					for (const identity of searchResults) {
						if (JSON.stringify(identity) === JSON.stringify(identifier.identityFromString(table, identityString))) {
							isDuplicate = true;
						}
					}
					
					if (isDuplicate === false) {
						searchResults.push(identifier.identityFromString(table, identityString));
					}
				}
			}
			
			output.push({
				relationship: relationship, 
				list: searchResults
			});
		}
		
		return output;
	}
	
	async #loopThroughRelationships (callbackFunction) {
		let state = {};
		
		for (let relationshipList of this.relationshipLists) {
			for (let index in relationshipList.list) {
				const identityString = identifier.identityToString(relationshipList.relationship.split("_")[0], relationshipList.list[index]);
				relationshipList.list[index] = new SSHead(identityString, this);
			}
			
			relationshipList.list.forEachAsync = async function (callbackFunction, parentHead) {
				if (typeof callbackFunction !== "function") {
					throw new TypeError(callbackFunction + " is not a function");
				}
				
				let list = this;
				parentHead = parentHead || this;
				for (let i = 0; i < list.length; i++) {
					await callbackFunction.call(parentHead, list[i], i, list);
				}
			}
			
			
			const parentHead = this;
			relationshipList.list.pushHead = async function (identityString, callbackFunction = null) {
				if (typeof identityString === "object") {
					identityString = identifier.identityToString(relationshipList.relationship, await window.assembly.generateKeys({_uuid: identityString}));
				}
				
				let list = this;
				list.push(new SSHead(identityString, parentHead));
				
				if (typeof callbackFunction === "function") {
					await callbackFunction.call(this, list[list.length - 1]);
				}
				
			}
			
			this.currentRelationship = relationshipList.relationship;
			await callbackFunction(relationshipList.list, relationshipList.relationship, this, state);
		}
		
		delete this.currentRelationship;
	}
	
	async forEachRelationship (callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.relationshipLists = await this.#searchForRelationships(this.identityString, sendSearches);
		await this.#loopThroughRelationships(callbackFunction);
	}
	
	async forEachRelationshipOf (relationshipsToSearch, callbackFunction, sendSearches = true) {
		identifier.assertIdentityStringLength(8, this.identityString);
		this.relationshipLists = await this.#searchForRelationships(this.identityString, sendSearches, relationshipsToSearch);
		await this.#loopThroughRelationships(callbackFunction);
	}
	
	async get () {
		let table = this.parentHead.currentRelationship.split("_")[0];
		let identity = identifier.identityFromString(table, this.identityString);
		let item = await window.assembly.getState(table, identity);
		return window.assembly.state[table][identifier.identityToString(table, identity)];
	}
	
	async set (item) {
		let table = this.parentHead.currentRelationship.split("_")[0];
		let identity = identifier.identityFromString(table, this.identityString);
		item = await window.assembly.generateKeys(item, table === "object");
		await window.assembly.setState(table, identity, item);
	}
}