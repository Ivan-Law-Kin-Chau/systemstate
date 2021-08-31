var Assembly = require("./assembly.js");

module.exports = class Packaging extends Assembly {
	async iterative_search (iterateFunction, conditionFunction, uuid, wildCard = false) {
		if (wildCard === true && uuid !== "%") {
			uuid = "%" + uuid + "%";
		}
		
		const searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		for (let searchArrayIndex = 0; searchArrayIndex < searchArrays.length; searchArrayIndex++) {
			let array = searchArrays[searchArrayIndex];
			let searchResult = JSON.parse(await this.search(array.split("_")[1], uuid, array.split("_")[0]))._uuid;
			
			if (conditionFunction(searchResult) === true) {
				var output = true;
			} else {
				var output = false;
			}
			
			if (output === true) {
				await iterateFunction(searchResult, array);
			}
		}
	}
	
	async check (uuid) {
		let output = {};
		await this.iterative_search(async function (searchResult, array) {
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
		return JSON.stringify(output);
	}
	
	async open (uuid) {
		let initialLoad = JSON.parse(await this.load_object(uuid));
		if (initialLoad._uuid === uuid) {
			let output = {};
			let packaging = this;
			await this.iterative_search(async function (searchResult, array) {
				for (let i = 0; i < searchResult.length; i++) {
					let uuidList = Object.values(searchResult[i]);
					searchResult[i] = false;
					let functionName = "load_" + array.split("_")[0];
					let elementFromUuidList = JSON.parse(await packaging[functionName].apply(packaging, uuidList));
					if (elementFromUuidList !== null && elementFromUuidList._success === true) {
						elementFromUuidList._dependencies = JSON.parse(await packaging.check(elementFromUuidList._uuid));
						searchResult[i] = elementFromUuidList;
					}
				}
				
				output[array] = searchResult;
			}, (searchResult) => (searchResult !== null && searchResult.length > 0), uuid);
			return JSON.stringify(output);
		} else {
			return JSON.stringify({
				_success: false, 
				_type: "Systemstate Error", 
				_sql: initialLoad._sql, 
				_error: "Not found", 
			});
		}
	}
}