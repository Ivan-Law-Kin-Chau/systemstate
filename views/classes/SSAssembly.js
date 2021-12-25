import SSSender from "./SSSender.js";

import * as items from "./Items/All.js";
import * as convertor from "../../scripts/convertor.js";
import * as identifier from "../../scripts/identifier.js";

export default class SSAssembly {
	constructor () {
		this.sender = new SSSender();
		
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
	
	identityToLoadCommand (type, identity) {
		if (type === "group") {
			return ["load_" + type, "(\"" + identity._uuid + "\", \"" + identity._parent + "\")"];
		} else {
			return ["load_" + type, "(\"" + identity._uuid + "\")"];
		}
	}
	
	async getState (type, identity) {
		var identityString = identifier.identityToString(type, identity);
		if (typeof this.state[type][identityString] === "undefined") {
			var loadCommand = this.identityToLoadCommand(type, identity);
			var item = await this.sender.send(loadCommand[0], loadCommand[1]);
			if (item._success === true) {
				let validatorClass = eval("(new items[\"" + convertor.convertCamelCaseToSS(type) + "\"]())");
				if (validatorClass.validate(item) === true) {
					this.state[type][identityString] = item;
				} else {
					throw "Invalid item: [\"" + type + "\", \"" + identityString + "\"]";
				}
			} else if (item._success === false) {
				throw "Item not found: [\"" + type + "\", \"" + identityString + "\"]";
			}
		}
		
		return [type, identityString];
	}
	
	async setState (type, identity, content = null) {
		var identityString = identifier.identityToString(type, identity);
		if (typeof this.state[type][identityString] === "undefined") {
			var loadCommand = this.identityToLoadCommand(type, identity);
			var item = await this.sender.send(loadCommand[0], loadCommand[1]);
			if (item._success === false) {
				item = this.defaults[type];
				item._type = type;
				item._add = true;
			}
		} else {
			item = this.state[type][identityString];
		}
		
		if (content === null) item._remove = true;
		
		for (let key in content) {
			if (!(item[key] === content[key])) {
				item[key] = content[key];
				if (!(item._add === true || item._remove === true)) item._save = true;
			}
		}
		
		let itemInstance = eval("(new items[\"" + convertor.convertCamelCaseToSS(type) + "\"]())");
		let validationResult = itemInstance.validate(item);
		if (validationResult === true) {
			this.state[type][identityString] = item;
		} else if (validationResult === false) {
			throw "Invalid item";
		}
		
		return [type, identityString];
	}
	
	async syncWithServer () {
		this.sender.clearCache();
		
		for (let type in this.state) {
			for (let identityString in this.state[type]) {
				const item = this.state[type][identityString];
				if (item._add === true || item._remove === true) {
					if (item._add === true) {
						if (item._type === "object") {
							this.sender.push("add_" + type, "(\"" + item._uuid + "\")");
						} else if (item._type === "group") {
							this.sender.push("add_" + type, "(\"" + item._uuid + "\", \"" + item._parent + "\")");
						} else if (item._type === "link") {
							this.sender.push("add_" + type, "(\"" + item._uuid + "\", \"" + item._start + "\", \"" + item._end + "\", " + item._direction + ")");
						} else if (item._type === "property") {
							this.sender.push("add_" + type, "(\"" + item._uuid + "\", \"" + item._parent + "\", \"" + item._name + "\", \"" + item._content + "\")");
						}
					}
					
					if (item._remove === true) {
						if (item._type === "object") {
							this.sender.push("remove_" + type, "(\"" + item._uuid + "\")");
						} else if (item._type === "group") {
							this.sender.push("remove_" + type, "(\"" + item._uuid + "\", \"" + item._parent + "\")");
						} else if (item._type === "link") {
							this.sender.push("remove_" + type, "(\"" + item._uuid + "\")");
						} else if (item._type === "property") {
							this.sender.push("remove_" + type, "(\"" + item._uuid + "\")");
						}
					}
				} else if (item._save === true) {
					const identity = identifier.identityFromString(type, identityString);
					if (item._type === "object") {
						this.sender.push("save_" + type, "(\"" + identity._uuid + "\", \"" + item._uuid + "\")");
					} else if (item._type === "group") {
						this.sender.push("save_" + type, "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + identity._parent + "\", \"" + item._parent + "\")");
					} else if (item._type === "link") {
						this.sender.push("save_" + type, "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + item._start + "\", \"" + item._end + "\", " + item._direction + ")");
					} else if (item._type === "property") {
						this.sender.push("save_" + type, "(\"" + identity._uuid + "\", \"" + item._uuid + "\", \"" + item._parent + "\", \"" + item._name + "\", \"" + item._content + "\")");
					}
					
					this.sender.pushCallback(
						// Move the item to the updated location according to its new _uuid (and new _parent if the item is a group)
						(function () {
							var identityStringToDelete = identifier.identityToString(type, identity);
							var identityStringToAdd = identifier.identityToString(type, item);
							
							if (item._save) delete item._save;
							
							if (identityStringToDelete !== identityStringToAdd) {
								delete this.state[type][identityStringToDelete];
								this.state[type][identityStringToAdd] = item;
							}
						}).bind(this)
					);
				}
			}
		}
		
		return this.sender.execute();
	}
}