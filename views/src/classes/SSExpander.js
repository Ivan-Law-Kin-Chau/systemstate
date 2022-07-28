import * as identifier from "../scripts/identifier.js";

export default class SSExpander {
	constructor (assembly) {
		this.assembly = assembly;
		this.sender = assembly.sender;
	}
	
	async expand (uuid) {
		const assembly = this.assembly;
		const sender = this.sender;
		const iterate = async function (uuid, iterateFunction) {
			const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
			for (let searchArrayIndex = 0; searchArrayIndex < searchArrays.length; searchArrayIndex++) {
				let array = searchArrays[searchArrayIndex];
				
				let searchResult = null;
				if (assembly.clientOnlyMode === false) {
					searchResult = (await sender.send("search", `("${array.split("_")[1]}", "${uuid}", "${array.split("_")[0]}")`))._output;
				} else {
					searchResult = [];
					let searchArea = assembly.state[array.split("_")[0]];
					for (const itemKey in searchArea) {
						const item = searchArea[itemKey];
						if (array.split("_")[0] === "group") {
							if (item["_" + array.split("_")[1]] === uuid) searchResult.push({_uuid: item._uuid, _parent: item._parent});
						} else {
							if (item["_" + array.split("_")[1]] === uuid) searchResult.push({_uuid: item._uuid});
						}
					}
				}
				
				if (searchResult !== null) await iterateFunction(array, searchResult);
			}
		};
		
		let output = {};
		await iterate(uuid, function (array, searchResult) {
			output[array] = Object.values(searchResult);
			if (output[array].length === 0) {
				delete output[array];
			}
		});
		
		return output;
	}
}