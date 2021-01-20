editorStore = Redux.createStore(function (state = {}, action = {}) {
	console.log("editorStore", action);
	
	var stateIterate = function(iterateFunction, state, condition, loop = null) {
		iterateLoop = ["group_uuid", "object_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		for (iterateCounter = 0; iterateCounter < iterateLoop.length; iterateCounter++) {
			array = iterateLoop[iterateCounter];
			if (state.editor[array]) {
				if (loop == false) {
					if (eval(condition)) iterateFunction(array);
				} else {
					for (i = 0; i < state.editor[array].length; i++) {
						if (loop == null) {
							if (eval(condition)) iterateFunction(array, i);
						} else {
							for (j = 0; j < loop.length; j++) {
								variable = loop[j];
								if (eval(condition)) iterateFunction(array, i, variable);
							}
						}
					}
				}
			}
		}
	}
	
	if (action.type === "empty") {
		state = {};
	} else if (action.type === "reset") {
		state.editor = action.editor;
		var insertJson = function(array, attribute, target) {
			output = {};
			for (preexistingAttribute in array) {
				output[preexistingAttribute] = array[preexistingAttribute];
				if (preexistingAttribute == target) {
					output[attribute] = array[target];
				}
			}
			return output;
		}
		stateIterate(function(array, i) {
			state.editor[array][i] = insertJson(state.editor[array][i], "_old", "_uuid");
			if (array.split("_")[0] == "group") {
				state.editor[array][i] = insertJson(state.editor[array][i], "_parentOld", "_parent");
			}
		}, state, true);
	} else if (action.type === "add") {
		var array = action.array;
		var uuid = action.key;
		if (typeof uuid === "undefined") uuid = null;
		var opposite = action.opposite;
		if (typeof opposite === "undefined") opposite = false;
		var editor = state.editor;
		if (opposite == true) {
			if (uuid == null) {
				uuid = editor[array][0]._uuid;
			}
			for (i = 0; i < editor[array].length; i++) {
				if (editor[array][i]._uuid == uuid) {
					if (editor[array][i]._add == true) {
						editor[array].splice(0 - (editor[array].length - i), 1);
					}
				}
			}
		} else {
			if (!(editor[array])) {
				editor[array] = [];
			}
			if (uuid == null) {
				index = 0;
			} else {
				for (i = 0; i < editor[array].length; i++) {
					if (editor[array][i]._uuid == uuid) {
						index = i + 1;
					}
				}
			}
			if (array.indexOf("object") == 0) {
				editor[array].splice(index, 0, {
					"_uuid": "", 
					"_type": "object", 
					"_add": true
				});
			}
			if (array.indexOf("group") == 0) {
				editor[array].splice(index, 0, {
					"_uuid": "", 
					"_parent": "", 
					"_type": "group", 
					"_add": true
				});
			}
			if (array.indexOf("link") == 0) {
				editor[array].splice(index, 0, {
					"_uuid": "", 
					"_start": "", 
					"_end": "", 
					"_direction": null, 
					"_type": "link", 
					"_add": true
				});
			}
			if (array.indexOf("property") == 0) {
				editor[array].splice(index, 0, {
					"_uuid": "", 
					"_parent": "", 
					"_name": "", 
					"_content": "", 
					"_type": "property", 
					"_add": true
				});
			}
			editor[array][index]["_" + array.split("_")[1]] = currentlyOpened;
		}
	} else if (action.type === "remove") {
		var array = action.array;
		var uuid = action.key;
		if (typeof uuid === "undefined") uuid = null;
		var opposite = action.opposite;
		if (typeof opposite === "undefined") opposite = false;
		var editor = state.editor;
		if (array == "group_uuid") {
			buffer = "_parent";
		} else if (array == "group_parent") {
			buffer = "_uuid";
		} else {
			buffer = "_uuid";
		}
		if (uuid == null) {
			uuid = editor[array][editor[array].length - 1][buffer];
		}
		for (i = 0; i < editor[array].length; i++) {
			if (editor[array][i][buffer] == uuid) {
				if (opposite == true) {
					delete editor[array][i]._remove;
				} else {
					editor[array][i]._remove = true;
				}
			}
		}
	} else if (action.type === "update") {
		const array = action.array;
		const attribute = action.attribute;
		const updatedValue = action.updated;
		const index = action.index;
		
		// If a key is edited, all instances of that key within editorStore should also be updated accordingly
		originalValue = state.editor[array][index][attribute];
		stateIterate(function(array, i, variable) {
			if (state.editor[array][i][variable]) {
				if (state.editor[array][i][variable] == originalValue) {
					state.editor[array][i][variable] = updatedValue;
				}
			}
		}, state, "state.editor[array][i]", ["_uuid", "_parent", "_start", "_end"]);
		
		state.editor[array][index][attribute] = updatedValue;
	}
	return state;
});

class SSElement extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({
			"mode": "open"
		});
	}
	
	connectedCallback() {
		var styleElement = document.createElement("style");
		styleElement.innerHTML = "@import 'resources/main.css'";
		this.shadow.appendChild(styleElement);
		this.instantiate();
	}
	
	instantiate() {
		// These would be null if the element does not have the attribute from getAttribute
		var type = this.getAttribute("type");
		var array = this.getAttribute("array");
		var index = this.getAttribute("index");
		var attribute = this.getAttribute("attribute");
		var item = editorStore.getState().editor[array][index];
		
		var classes = {
			"this": {
				"type": "span", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": "#this"
				}, 
				"listeners": [
					{
						"triggers": ["click"], 
						"callback": function () {
							selectorStore.dispatch({
								"type": "select", 
								"selection": {
									"array": array, 
									"index": index, 
									"action": "element", 
									"attribute": attribute
								}
							});
						}
					}
				]
			}, 
			"selector": {
				"type": "span", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": "#"
				}, 
				"listeners": [
					{
						"triggers": ["click"], 
						"callback": function () {
							selectorStore.dispatch({
								"type": "select", 
								"selection": {
									"array": array, 
									"index": index, 
									"action": "element", 
									"attribute": attribute
								}
							});
						}
					}
				]
			}, 
			"add": {
				"type": "span", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": "#add"
				}, 
				"listeners": [
					{
						"triggers": ["click"], 
						"callback": function () {
							selectorStore.dispatch({
								"type": "select", 
								"selection": {
									"array": array, 
									"index": index, 
									"action": "add", 
									"attribute": attribute
								}
							});
						}
					}
				]
			}, 
			"remove": {
				"type": "span", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": "#remove"
				}, 
				"listeners": [
					{
						"triggers": ["click"], 
						"callback": function () {
							selectorStore.dispatch({
								"type": "select", 
								"selection": {
									"array": array, 
									"index": index, 
									"action": "remove", 
									"attribute": attribute
								}
							});
						}
					}
				]
			}, 
			"button": {
				"type": "button", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": direction_convert(item[attribute])
				}, 
				"listeners": [
					{
						"triggers": ["mouseup"], 
						"callback": function () {
							if (customElement.value == null) {
								customElement.value = true;
							} else if (customElement.value == true) {
								customElement.value = false;
							} else if (customElement.value == false) {
								customElement.value = null;
							}
							shadowElement.innerHTML = direction_convert(customElement.value);
							editorStore.dispatch({
								"type": "update", 
								"array": array, 
								"attribute": attribute, 
								"updated": customElement.value, 
								"index": index
							});
						}
					}
				]
			}, 
			"key": {
				"type": "input", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"type": "input", 
					"value": item[attribute], 
					"maxLength": "8", 
					"style": {
						"minWidth": "72px", 
						"maxWidth": "72px", 
						"padding": "0px"
					}
				}, 
				"listeners": [
					{
						"triggers": ["blur"], 
						"callback": function () {
							editorStore.dispatch({
								"type": "update", 
								"array": array, 
								"attribute": attribute, 
								"updated": this.value, 
								"index": index
							});
						}
					}, 
					{
						"triggers": ["click"], 
						"callback": function () {
							visitKey(this.value);
						}
					}
				]
			}, 
			"input": {
				"type": "input", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"type": "text", 
					"value": item[attribute], 
					"style": {
						"display": "inline-block", 
						"position": "relative", 
						"top": "-2px"
					}
				}, 
				"listeners": [
					{
						"triggers": ["blur"], 
						"callback": function () {
							editorStore.dispatch({
								"type": "update", 
								"array": array, 
								"attribute": attribute, 
								"updated": this.value, 
								"index": index
							});
						}
					}, 
					{
						"triggers": ["load", "select", "keydown", "keypress", "change", "input"], 
						"callback": function () {
							this.style.width = simulate(this.value).width;
							this.style.height = simulate(this.value).height;
						}
					}
				]
			}, 
			"textarea": {
				"type": "textarea", 
				"attributes": {
					"id": array + "_" + index + attribute, 
					"innerHTML": item[attribute], 
					"type": "text", 
					"style": {
						"position": "relative", 
						"top": "1px"
					}
				}, 
				"listeners": [
					{
						"triggers": ["blur"], 
						"callback": function () {
							editorStore.dispatch({
								"type": "update", 
								"array": array, 
								"attribute": attribute, 
								"updated": this.value, 
								"index": index
							});
						}
					}, 
					{
						"triggers": ["load", "select", "keydown", "keypress", "change", "input"], 
						"callback": function () {
							this.style.width = simulate(this.value).width;
							this.style.height = simulate(this.value).height;
						}
					}
				]
			}
		};
		
		var elementClass = classes[type];
		
		var customElement = this;
		customElement.id = elementClass.attributes.id;
		customElement.value = item[attribute];
		
		var shadowElement = document.createElement(elementClass.type);
		for (let attribute in elementClass.attributes) {
			try {
				if (attribute === "style") {
					for (let style in elementClass.attributes[attribute]) {
						shadowElement[attribute][style] = elementClass.attributes[attribute][style];
					}
				} else {
					shadowElement[attribute] = elementClass.attributes[attribute];
				}
			} catch (error) {
				shadowElement.setAttribute(attribute, elementClass.attributes[attribute]);
			}
		}
		
		for (let i = 0; i < elementClass.listeners.length; i++) {
			for (let trigger of elementClass.listeners[i].triggers) {
				shadowElement.addEventListener(trigger, elementClass.listeners[i].callback);
			}
		}
		
		this.shadow.appendChild(shadowElement);
		shadowElement.dispatchEvent(new CustomEvent("load", {}));
	}
	
	getShadowAttribute(attribute) {
		return this.shadow.childNodes[1][attribute];
	}
	
	setShadowAttribute(attribute, value) {
		this.shadow.childNodes[1][attribute] = value;
	}
	
	getShadowStyle(attribute) {
		return this.shadow.childNodes[1].style[attribute];
	}
	
	setShadowStyle(attribute, value) {
		this.shadow.childNodes[1].style[attribute] = value;
	}
}

customElements.define("ss-element", SSElement);
generateElement = function (type, array, index, attribute) {
	let customElement = document.createElement("ss-element");
	customElement.setAttribute("type", type);
	customElement.setAttribute("array", array);
	customElement.setAttribute("index", index);
	customElement.setAttribute("attribute", attribute);
	customElement.instantiate();
	return customElement.outerHTML;
}

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

generateEditor = function () {
	var itemAddRemove = function(editor, item = false, index = null, array) {
		if (index === null) {
			index = editor[array].length;
		}
		output = "";
		if (item._add == true) {
			output += " " + generateElement("add", array, index, "_add");
		}
		if (item._remove == true) {
			output += " " + generateElement("remove", array, index, "_remove");
		}
		return output;
	}
	
	var removeLastComma = function(input) {
		if (input.slice(-2) == ", ") {
			input = input.substring(0, input.length - 2);
		}
		return input;
	}
	
	var editor = editorStore.getState().editor;
	var results = "";
	var firstNewLineAdded = false;
	var orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
	
	for (var arrayIndex = 0; arrayIndex < orderOfArrays.length; arrayIndex++) {
		var array = orderOfArrays[arrayIndex];
		if (!(editor[array])) continue;
		
		let index;
		let metaResults = "";
		
		for (index = 0; index < editor[array].length; index++) {
			let item = editor[array][index];
			let types = {
				"object": [["selector"], ["key"], itemAddRemove(editor, item, index, array), " this", ", "], 
				"group": [["selector"], ["key"], itemAddRemove(editor, item, index, array), ", "], 
				"link": [["key", "uuid"], ": ", ["key", "start"], " ", ["button", "direction"], " ", ["key", "end"], new_line()], 
				"property": [["key", "uuid"], ": ", ["key", "parent"], ": ", ["input", "name"], ": ", new_line(), ["textarea", "content"], new_line()]
			};
			
			templateType = array.split("_")[0];
			templateThis = array.split("_")[1];
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
						templateArray.splice(i + 1, 0, itemAddRemove(editor, item, index, array));
						break;
					}
				}
			}
			processArray = [];
			for (j = 0; j < templateArray.length; j++) {
				if (Array.isArray(templateArray[j])) {
					processArray[j] = generateElement(templateArray[j][0], array, index, "_" + templateArray[j][1]);
				}
				if (typeof templateArray[j] == "string") {
					processArray[j] = templateArray[j];
				}
			}
			metaResults += processArray.join("");
		}
		if (array == "group_uuid" && results != "") {
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
		if (array == "group_parent" && results != "") {
			results += ": ";
		}
	}
	
	if (document.getElementById("sidebar").innerHTML !== results) {
		document.getElementById("sidebar").innerHTML = results;
	}
}

editorStore.subscribe(function () {
	if (JSON.stringify(editorStore.getState()) === "{}") {
		document.getElementById("sidebar").innerHTML = "No Content";
		document.getElementById("sidebarPreview").innerHTML = "No Content";
		selectorStore.dispatch({
			"type": "reset"
		});
	} else {
		generateEditor();
		
		(function () {
			const uncolorTarget = selectorStore.getState().uncolorTarget;
			if (uncolorTarget !== null) {
				document.getElementById(uncolorTarget).setShadowStyle("color", "#FF0000");
			}
		})();
		
		(function () {
			var editor = editorStore.getState().editor;
			if (editor != null) {
				document.getElementById("sidebarPreview").innerHTML = JSON.stringify(editor, null, 4);
			}
		})();
	}
});