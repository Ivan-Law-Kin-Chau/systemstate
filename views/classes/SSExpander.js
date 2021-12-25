export default class SSExpander {
	constructor (send = function () {}) {
		this.send = send;
	}
	
	async expand (uuid) {
		const iterate = (async function (iterateFunction, conditionFunction, uuid, wildCard = false) {
			if (wildCard === true && uuid !== "%") {
				uuid = "%" + uuid + "%";
			}
			
			const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
			for (let searchArrayIndex = 0; searchArrayIndex < searchArrays.length; searchArrayIndex++) {
				let array = searchArrays[searchArrayIndex];
				let searchResult = (await this.send(`search("${array.split("_")[1]}", "${uuid}", "${array.split("_")[0]}")`))._uuid;
				
				if (conditionFunction(searchResult) === true) {
					var output = true;
				} else {
					var output = false;
				}
				
				if (output === true) {
					await iterateFunction(searchResult, array);
				}
			}
		}).bind(this);
		
		let output = {};
		await iterate(async function (searchResult, array) {
			output[array] = Object.values(searchResult);
			for (let i = 0; i < output[array].length; i++) {
				if (array.split("_")[0] === "group") {
					delete output[array][i][array.split("_")[1]];
				}
				output[array][i] = Object.values(output[array][i])[0];
			}
			
			for (let outputArrayElement of output[array]) {
				let index = Object.values(outputArrayElement).indexOf(uuid);
				if (index !== -1) output[array].splice(index, 1);
			}
			
			if (output[array].length === 0) {
				delete output[array];
			}
		}, (searchResult) => (searchResult !== null), uuid);
		return output;
	}
}