var simulate = function(input) {
	var virtualElement = document.createElement("pre");
	virtualElement.style.display = "inline-block";
	virtualElement.style.visibility = "hidden";
	virtualElement.style.width = "auto";
	virtualElement.style.height = "auto";
	virtualElement.innerHTML = input;
	document.getElementsByTagName("body")[0].appendChild(virtualElement);
	if (input.split("\n")[input.split("\n").length - 1] == "") {
		var output = {
			"width": (virtualElement.getBoundingClientRect().width) + "px", 
			"height": (virtualElement.getBoundingClientRect().height + 20) + "px"
		};
	} else {
		var output = {
			"width": (virtualElement.getBoundingClientRect().width) + "px", 
			"height": (virtualElement.getBoundingClientRect().height + 1) + "px"
		};
	}
	virtualElement.outerHTML = "";
	virtualElement.remove();
	return output;
}

var generateElement = function (input) {
	const Type = eval(input[0][0].toUpperCase() + input[0].substring(1));
	const array = input[1];
	const index = input[2];
	const attribute = input[3];
	const focused = input[4];
	const seed = input[5];
	return (
		<Type {...{array, index, attribute, focused, seed}}></Type>
	);
}

var generateEditor = function (focused, seed) {
	var itemAddRemove = function(editor, item = false, index = null, array) {
		if (index === null) {
			index = editor[array].length;
		}
		output = [];
		if (item._add == true) {
			output.push(" ");
			output.push(generateElement(["add", array, index, "_add", focused, seed]));
		}
		if (item._remove == true) {
			output.push(" ");
			output.push(generateElement(["remove", array, index, "_remove", focused, seed]));
		}
		return output;
	}
	
	var editor = reduxStore.getState().editor;
	var results = [];
	var firstNewLineAdded = false;
	var orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
	
	for (var arrayIndex = 0; arrayIndex < orderOfArrays.length; arrayIndex++) {
		var array = orderOfArrays[arrayIndex];
		if (!(editor[array])) continue;
		
		let index;
		let metaResults = [];
		
		for (index = 0; index < editor[array].length; index++) {
			let item = editor[array][index];
			let types = {
				"object": [["selector"], ["key"], ...itemAddRemove(editor, item, index, array), " this"], 
				"group": [["selector"], ["key"], ...itemAddRemove(editor, item, index, array)], 
				"link": [["key", "uuid"], ": ", ["key", "start"], " ", ["button", "direction"], " ", ["key", "end"]], 
				"property": [["key", "uuid"], ": ", ["key", "parent"], ": ", ["input", "name"], ": ", new_line(), ["textarea", "content"], new_line()]
			};
			
			let templateType = array.split("_")[0];
			let templateThis = array.split("_")[1];
			let templateArray = types[templateType];
			if (templateType == "group") {
				if (templateThis == "uuid") {
					templateThis = "parent";
				} else if (templateThis == "parent") {
					templateThis = "uuid";
				}
			}
			for (i = 0; i < templateArray.length; i++) {
				if (Array.isArray(templateArray[i])) {
					if (templateArray[i].length == 1) {
						templateArray[i][1] = templateThis;
					} else if (templateArray[i][1] == templateThis) {
						templateArray[i][0] = "this";
						templateArray = [...templateArray.slice(0, i + 1), ...itemAddRemove(editor, item, index, array), ...templateArray.slice(i + 1)];
						break;
					}
				}
			}
			let processArray = [];
			for (j = 0; j < templateArray.length; j++) {
				if (Array.isArray(templateArray[j])) {
					processArray[j] = generateElement([templateArray[j][0], array, index, "_" + templateArray[j][1], focused, seed]);
				} else {
					processArray[j] = templateArray[j];
				}
			}
			if ((array == "group_uuid" || array == "object_uuid" || array == "group_parent") && index + 1 < editor[array].length) processArray.push(", ");
			metaResults = [...metaResults, ...processArray];
		}
		if (array == "group_uuid" && results != []) {
			results.push(": ");
		}
		if (array.split("_")[0] == "link" || array.split("_")[0] == "property") results.push(new_line());
		results = [...results, ...metaResults];
		if (array == "group_parent" && results != "") {
			results.push(": ");
		}
	}
	
	return results;
}