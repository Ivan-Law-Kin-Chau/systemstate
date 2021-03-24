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
		var item = reduxStore.getState().editor[array][index];
		
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
							reduxStore.dispatch({
								"type": "SELECTOR_SELECT", 
								"cache": reduxStore.getState().editor, 
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
							reduxStore.dispatch({
								"type": "SELECTOR_SELECT", 
								"cache": reduxStore.getState().editor, 
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
							reduxStore.dispatch({
								"type": "SELECTOR_SELECT", 
								"cache": reduxStore.getState().editor, 
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
							reduxStore.dispatch({
								"type": "SELECTOR_SELECT", 
								"cache": reduxStore.getState().editor, 
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
							reduxStore.dispatch({
								"type": "EDITOR_UPDATE", 
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
							reduxStore.dispatch({
								"type": "EDITOR_UPDATE", 
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
							reduxStore.dispatch({
								"type": "EDITOR_UPDATE", 
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
							reduxStore.dispatch({
								"type": "EDITOR_UPDATE", 
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
	
	var editor = reduxStore.getState().editor;
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