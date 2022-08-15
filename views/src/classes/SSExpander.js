import * as identifier from "../scripts/identifier.js";

export default class SSExpander {
	static async expand (key) {
		const iterate = async function (key, iterateFunction) {
			const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
			for (const array of searchArrays) {
				let searchResult = null;
				if (window.assembly.clientOnlyMode === false) {
					searchResult = (await window.assembly.sender.send("search", `("${array.split("_")[1]}", "${key}", "${array.split("_")[0]}")`))._output;
				} else {
					searchResult = [];
					let searchArea = window.assembly.state[array.split("_")[0]];
					for (const itemKey in searchArea) {
						const item = searchArea[itemKey];
						if (array.split("_")[0] === "group") {
							if (item["_" + array.split("_")[1]] === key) searchResult.push({_uuid: item._uuid, _parent: item._parent});
						} else {
							if (item["_" + array.split("_")[1]] === key) searchResult.push({_uuid: item._uuid});
						}
					}
				}
				
				if (searchResult !== null) await iterateFunction(array, searchResult);
			}
		};
		
		let output = {};
		await iterate(key, function (array, searchResult) {
			output[array] = Object.values(searchResult);
			if (output[array].length === 0) {
				delete output[array];
			}
		});
		
		return output;
	}
}