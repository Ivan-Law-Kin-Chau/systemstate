import * as identifier from "../scripts/identifier.js";

export default class SSExpander {
	static async expand (key) {
		let output = {};
		
		const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		
		/*
		
		Search for items that have the correct relationships with the key either on the server or in the SSSender cache, and then add to the search results those that are not yet on the server or in the SSSender cache, but already in the SSAssembly state. There will not be items that are no longer in the SSAssembly state, but still on the server or in the SSSender cache to remove, so the code to do so will not be written (to know why, read the comment just above the "this.state = {" line in the SSAssembly class)
		
		*/
		for (const array of searchArrays) {
			const type = array.split("_")[0];
			const headAttribute = array.split("_")[1];
			const searchResults = JSON.parse(JSON.stringify((await window.assembly.sender.send("search", `("${headAttribute}", "${key}", "${type}")`))._output));
			
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
			
			if (searchResults.length > 0) output[array] = searchResults;
		}
		
		return output;
	}
}