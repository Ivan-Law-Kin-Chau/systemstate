import * as items from "./All.js";
import * as convertor from "../../scripts/convertor.js";
import * as identifier from "../../scripts/identifier.js";

export default class SSAssembly {
	constructor () {
		this.itemPrototype = {
			_add: false, 
			_remove: false, 
			_contents: null
		};
		
		this.state = {
			object: {}, 
			group: {}, 
			link: {}, 
			property: {}
		};
		
		this.defaults = {
			object: {
				_uuid: ""
			}, 
			group: {
				_uuid: "", 
				_parent: ""
			}, 
			link: {
				_uuid: "", 
				_start: "", 
				_end: "", 
				_direction: null
			}, 
			property: {
				_uuid: "", 
				_parent: "", 
				_name: "", 
				_content: ""
			}
		};
	}
	
	async getState (type, identity) {
		var identityString = identifier.identityToString(type, identity);
		if (type === "group") {
			var loadString = "load_" + type + "(\"" + identity._uuid + "\", \"" + identity._parent + "\")";
		} else {
			var loadString = "load_" + type + "(\"" + identity._uuid + "\")";
		}
		
		if (typeof this.state[type][identityString] === "undefined") {
			var item = await send(loadString);
			if (item._success === true) {
				this.state[type][identityString] = item;
			} else if (item._success === false) {
				throw "Item not found";
			}
		}
		
		return this.state[type][identityString];
	}
	
	async setState (type, identity, content = null) {
		var identityString = identifier.identityToString(type, identity);
		if (type === "group") {
			var loadString = "load_" + type + "(\"" + identity._uuid + "\", \"" + identity._parent + "\")";
		} else {
			var loadString = "load_" + type + "(\"" + identity._uuid + "\")";
		}
		
		if (typeof this.state[type][identityString] === "undefined") {
			var item = await send(loadString);
			if (item._success === true) {
				item = item;
			} else if (item._success === false) {
				item = this.defaults[type];
				item._type = type;
				item._add = true;
			}
		} else {
			item = this.state[type][identityString];
		}
		
		for (let key in content) {
			item[key] = content[key];
		}
		
		if (content === null) item._remove = true;
		
		let itemInstance = eval("(new items[\"SS" + type[0].toUpperCase() + type.slice(1) + "\"]())");
		let validationResult = itemInstance.validate(item);
		if (validationResult === true) {
			this.state[type][identityString] = item;
		} else if (validationResult === false) {
			throw "Invalid item";
		}
		
		return this.state[type][identityString];
	}
	
	async syncWithServer () {
		var script = [];
		
		for (let type in this.state) {
			for (let identityString in this.state[type]) {
				const item = this.state[type][identityString];
				if (item._add === true || item._remove === true) {
					if (item._add === true) {
						if (item._type === "object") {
							script.push("add_" + type + "(\"" + item._uuid + "\")");
						} else if (item._type === "group") {
							script.push("add_" + type + "(\"" + item._uuid + "\", \"" + item._parent + "\")");
						} else if (item._type === "link") {
							script.push("add_" + type + "(\"" + item._uuid + "\", \"" + item._start + "\", \"" + item._end + "\", " + convertor.convertBooleanToDirection(item._direction) + ")");
						} else if (item._type === "property") {
							script.push("add_" + type + "(\"" + item._uuid + "\", \"" + item._parent + "\", \"" + item._name + "\", \"" + item._content + "\")");
						}
					}
					
					if (item._remove === true) {
						if (item._type === "object") {
							script.push("remove_" + type + "(\"" + item._uuid + "\")");
						} else if (item._type === "group") {
							script.push("remove_" + type + "(\"" + item._uuid + "\", \"" + item._parent + "\")");
						} else if (item._type === "link") {
							script.push("remove_" + type + "(\"" + item._uuid + "\")");
						} else if (item._type === "property") {
							script.push("remove_" + type + "(\"" + item._uuid + "\")");
						}
					}
				} else {
					const identity = identifier.identityFromString(type, identityString);
					if (item._type === "object") {
						script.push("save_" + type + "(\"" + identity._uuid + "\", \"" + item._uuid + "\")");
					} else if (item._type === "group") {
						script.push("save_" + type + "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + identity._parent + "\", \"" + item._parent + "\")");
					} else if (item._type === "link") {
						script.push("save_" + type + "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + item._start + "\", \"" + item._end + "\", " + convertor.convertBooleanToDirection(item._direction) + ")");
					} else if (item._type === "property") {
						script.push("save_" + type + "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + item._parent + "\", \"" + item._name + "\", \"" + item._content + "\")");
					}
					
					script.push(
						// Move the item to the updated location according to its new _uuid (and new _parent if the item is a group)
						(function () {
							var identityStringToDelete = identifier.identityToString(type, identity);
							delete this.state[type][identityStringToDelete];
							var identityStringToAdd = identifier.identityToString(type, item);
							this.state[type][identityStringToAdd] = item;
						}).bind(this)
					);
				}
			}
		}
		
		for (let line in script) {
			if (typeof script[line] === "string") {
				await send(script[line]);
			} else if (typeof script[line] === "function") {
				script[line]();
			}
		}
	}
}