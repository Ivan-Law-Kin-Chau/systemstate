import * as identifier from "../scripts/identifier.js";

export default class SSExpander {
	static async expand (key) {
		let output = {};
		
		const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		
		for (const array of searchArrays) {
			const type = array.split("_")[0];
			const templateThis = array.split("_")[1];
			const searchResults = JSON.parse(JSON.stringify((await window.assembly.sender.send("search", `("${templateThis}", "${key}", "${type}")`))._output));
			
			let searchArea = window.assembly.state[type];
			for (const identityString in searchArea) {
				const item = searchArea[identityString];
				if (item["_" + templateThis] === key) {
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