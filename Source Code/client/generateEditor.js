reload = function(editor, useD3 = true) {
	simulate = function(input) {
		virtualElement = document.createElement("pre");
		virtualElement.style.display = "inline-block";
		virtualElement.style.visibility = "hidden";
		virtualElement.style.width = "auto";
		virtualElement.style.height = "auto";
		virtualElement.innerHTML = input;
		document.getElementsByTagName("body")[0].appendChild(virtualElement);
		if (input.split("\n")[input.split("\n").length - 1] == "") {
			output = {
				"width": (virtualElement.getBoundingClientRect().width) + "px", 
				"height": (virtualElement.getBoundingClientRect().height + 20) + "px"
			};
		} else {
			output = {
				"width": (virtualElement.getBoundingClientRect().width) + "px", 
				"height": (virtualElement.getBoundingClientRect().height + 1) + "px"
			};
		}
		virtualElement.outerHTML = "";
		delete virtualElement;
		return output;
	}
	
	generateClassList = function(classes = [], variables = {}) {
		generateClass = function(className, variables = {}) {
			for (variable in variables) {
				if (typeof variable == "object") {
					for (subVariable in variables[variable]) {
						if (typeof this[variable] === "undefined") {
							this[variable] = {};
						}
						this[variable][subVariable] = variables[variable][subVariable];
					}
				} else {
					this[variable] = variables[variable];
				}
			}
			if (className == "this") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "span", 
					"js.innerHTML": "#this", 
					"onclick": "selector(`" + arrayName + "`, " + index + ", `element`, `" + attribute + "`);"
				};
			} else if (className == "selector") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "span", 
					"js.innerHTML": "#", 
					"onclick": "selector(`" + arrayName + "`, " + index + ", `element`, `" + attribute + "`);"
				};
			} else if (className == "add") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "span", 
					"js.innerHTML": " #add", 
					"onclick": "selector(`" + arrayName + "`, " + index + ", `add`);"
				};
			} else if (className == "remove") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "span", 
					"js.innerHTML": " #remove", 
					"onclick": "selector(`" + arrayName + "`, " + index + ", `remove`);"
				};
			} else if (className == "button") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "button", 
					"js.eval": "editor[`" + arrayName + "`][" + index + "][`" + attribute + "`] = " + boolean_convert(item[attribute]) + ";", 
					"js.innerHTML": direction_convert(item[attribute]), 
					"onmouseup": "eval(updateJson(`" + arrayName + "`, `" + attribute + "`, boolean_convert(this.value), " + index + ")); render();"
				};
			} else if (className == "key") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "input", 
					"type": "input", 
					"value": item[attribute], 
					"style": {
						"minWidth": "72px", 
						"maxWidth": "72px", 
						"padding": "0px"
					}, 
					"maxLength": "8", 
					"onblur": "eval(updateJson(`" + arrayName + "`, `" + attribute + "`, this.value, " + index + ")); render();", 
					"onclick": "visitKey(this.value);"
				};
			} else if (className == "input") {
				return {
					"id": arrayName + "_" + index + "_name", 
					"js.type": "input", 
					"type": "text", 
					"value": item[attribute], 
					"style": {
						"display": "inline-block", 
						"position": "relative", 
						"top": "-2px", 
						"width": simulate(item[attribute]).width, 
						"height": simulate(item[attribute]).height
					}, 
					"onblur": "eval(updateJson(`" + arrayName + "`, `" + attribute + "`, this.value, " + index + ")); render();", 
					"onselect": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onkeydown": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onkeypress": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onchange": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"oninput": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;"
				};
			} else if (className == "textarea") {
				return {
					"id": arrayName + "_" + index + attribute, 
					"js.type": "textarea", 
					"js.innerHTML": item[attribute], 
					"type": "text", 
					"style": {
						"position": "relative", 
						"top": "1px", 
						"width": simulate(item[attribute]).width, 
						"height": simulate(item[attribute]).height
					}, 
					"onblur": "eval(updateJson(`" + arrayName + "`, `" + attribute + "`, this.value, " + index + ")); render();", 
					"onselect": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onkeydown": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onkeypress": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"onchange": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;", 
					"oninput": "this.style.width = simulate(this.value).width; this.style.height = simulate(this.value).height;"
				};
			} else if (className == "nodeLabel") {
				return {
					"id": "nodeLabel_" + randomString, 
					"js.type": "div", 
					"js.innerHTML": innerHTML, 
					"style": {
						"position": "absolute", 
						"left": (x - 30) + "px", 
						"top": (y + 28.5) + "px"
					}, 
					"onclick": "mouseNodeInterface(`nodeLabel_" + randomString + "`, `click`);", 
					"onmouseenter": "mouseNodeInterface(`nodeLabel_" + randomString + "`, `enter`);", 
					"onmouseleave": "mouseNodeInterface(`nodeLabel_" + randomString + "`, `leave`);"
				};
			}
		};
		this.classList = {};
		for (i = 0; i < classes.length; i++) {
			this.classList[classes[i]] = generateClass(classes[i], variables);
		}
		return this.classList;
	}
	
	implement = function(json, type) {
		if (json["js.class"]) {
			classes = json["js.class"].split(" ");
			if (json["js.variables"]) {
				classList = generateClassList(classes, json["js.variables"]);
			} else {
				classList = generateClassList(classes);
			}
			for (i = 0; i < classes.length; i++) {
				if (classList[classes[i]]) {
					for (classKey in classList[classes[i]]) {
						if (typeof classList[classes[i]][classKey] == "object") {
							for (subClassKey in classList[classes[i]][classKey]) {
								if (typeof json[classKey] === "undefined") {
									json[classKey] = {};
								}
								if (typeof json[classKey][subClassKey] === "undefined") {
									json[classKey][subClassKey] = classList[classes[i]][classKey][subClassKey];
								}
							}
						} else {
							if (typeof json[classKey] === "undefined") {
								json[classKey] = classList[classes[i]][classKey];
							}
						}
					}
				}
			}
		}
		if (json["js.type"]) {
			virtualElement = document.createElement(json["js.type"]);
			for (key in json) {
				if (key == "js.innerHTML") {
					virtualElement.innerHTML = json[key];
				} else if (key == "js.eval") {
					eval(json[key]);
				}
				if (key.indexOf("js.") != 0) {
					if (typeof json[key] == "object") {
						for (subKey in json[key]) {
							if (typeof virtualElement[key] === "undefined") {
								virtualElement[key] = {};
							}
							virtualElement[key][subKey] = json[key][subKey];
						}
					} else {
						virtualElement.setAttribute(key, json[key]);
					}
				}
			}
			return virtualElement.outerHTML;
		}
	}
	
	meta = function(array) {
		metaResults = "";
		editor[array].forEach(function(item, index, arr) {
			metaResults += template(item, index, arr, array);
		});
		return metaResults;
	}
		
	template = function(item, index, arr, arrayName) {
		types = {
			"object": [["selector"], ["key"], itemAddRemove(item, index, arrayName), " this", ", "], 
			"group": [["selector"], ["key"], itemAddRemove(item, index, arrayName), ", "], 
			"link": [["key", "uuid"], ": ", ["key", "start"], " ", ["button", "direction"], " ", ["key", "end"], new_line()], 
			"property": [["key", "uuid"], ": ", ["key", "parent"], ": ", ["input", "name"], ": ", new_line(), ["textarea", "content"], new_line()]
		}
		templateType = arrayName.split("_")[0];
		templateThis = arrayName.split("_")[1];
		templateArray = types[templateType];
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
					templateArray.splice(i + 1, 0, itemAddRemove(item, index, arrayName));
					break;
				}
			}
		}
		processArray = [];
		for (j = 0; j < templateArray.length; j++) {
			if (Array.isArray(templateArray[j])) {
				processArray[j] = implement({
					"js.class": templateArray[j][0], 
					"js.variables": {
						"item": item, 
						"arrayName": arrayName, 
						"index": index, 
						"attribute": "_" + templateArray[j][1]
					}
				});
			}
			if (typeof templateArray[j] == "string") {
				processArray[j] = templateArray[j];
			}
		}
		return processArray.join("");
	}
	
	itemAddRemove = function(item = false, index = null, arrayName) {
		if (index === null) {
			index = editor[arrayName].length;
		}
		output = "";
		if (item._add == true) {
			output += implement({
					"js.class": "add", 
					"js.variables": {
						"item": item, 
						"arrayName": arrayName, 
						"index": index, 
						"attribute": "_add"
					}
			});
		}
		if (item._remove == true) {
			output += implement({
					"js.class": "remove", 
					"js.variables": {
						"item": item, 
						"arrayName": arrayName, 
						"index": index, 
						"attribute": "_remove"
					}
			});
		}
		return output;
	}
	
	removeLastComma = function(input) {
		if (input.slice(-2) == ", ") {
			input = input.substring(0, input.length - 2);
		}
		return input;
	}
	
	results = "";
	firstNewLineAdded = false;
	iterate(function(array) {
		if (editor[array].length == 0) {
			delete editor[array];
		} else {
			metaResults = meta(array);
			if (array == "group_parent" && metaResults != "") {
				results += ": ";
			}
			if (firstNewLineAdded == false && (array.split("_")[0] == "link" || array.split("_")[0] == "property")) {
				results += new_line();
				firstNewLineAdded = true;
			}
			results += metaResults;
			if (firstNewLineAdded == false && (array == "group_uuid" || array == "object_uuid" || array == "group_parent")) {
				results = removeLastComma(results);
			}
			if (array == "group_uuid" && metaResults != "") {
				results += ": ";
			}
		}
	}, "editor[array]", false);
	
	delimitAll(true);
	window.editor = editor;
	if (useD3 == true) {
		graphEngine = graph(editor);
	}
	return results;
}