import SSSender from "./SSSender.js";

import * as userInterfaces from "./UserInterfaces/All.js";
import * as convertor from "../scripts/convertor.js";
import * as identifier from "../scripts/identifier.js";
import * as generator from "../scripts/generator.js";

export default class SSAssembly {
	constructor () {
		this.sender = new SSSender();
		
		/*
		
		clientOnlyMode will be set to false when SSAssembly initializes and whenever the syncWithServer function is called, but set to true when the SSItemSelected class rerenders the Systemstate Editor. If clientOnlyMode is false, SSExpander expands by calling the search function on the server. If clientOnlyMode is true, SSExpander expands by searching within the state of SSAssembly
		
		*/
		this.clientOnlyMode = false;
		
		this.itemPrototype = {
			_add: false, 
			_remove: false, 
			_contents: null
		};
		
		/*
		
		DO NOT REMOVE THIS COMMENT: a comment in the SSExpander class references this
		
		In the four arrays below, the identity strings of the items will always be the same as when those items are first being loaded from the server, even if the user changed everything within an item, or removed an item, as long as the syncToServer function has not yet been called. (As for added items, they are added rather than loaded from the server, so there are no "identity strings of the items when they were first being loaded" for the identity strings in the four arrays to be the same with.) This ensures that the identity strings in the four arrays will not deviate from the SSSender cache unless the syncToServer function is called. Then, when the syncToServer function is called, the SSSender cache will be cleared and the identity strings in the four arrays will be updated according to the changes made by the user (if there are any)
		
		*/
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
			return [`load_${type}`, `("${identity._uuid}", "${identity._parent}")`];
		} else {
			return [`load_${type}`, `("${identity._uuid}")`];
		}
	}
	
	async generateKeys (details) {
		let generateKeyCodeLibrary = [];
		for (let attribute in details) {
			if (typeof details[attribute] === "object" && typeof details[attribute].generateKeyCode === "number") {
				if (typeof generateKeyCodeLibrary[details[attribute].generateKeyCode] === "undefined") {
					const key = generator.generateKey();
					generateKeyCodeLibrary[details[attribute].generateKeyCode] = key;
					await this.set("object", {_uuid: key});
				}
				
				details[attribute] = generateKeyCodeLibrary[details[attribute].generateKeyCode];
			}
		}
		
		return details;
	}
	
	async get (type, details) {
		details = await this.generateKeys(details);
		await this.getState(type, details);
		return this.state[type][identifier.identityToString(type, details)];
	}
	
	async set (type, details) {
		details = await this.generateKeys(details);
		var identity = JSON.parse(JSON.stringify(details));
		for (let attribute in identity) {
			if (!(attribute === "_uuid" || (attribute === "_parent" && type === "group"))) delete identity[attribute];
		}
		
		var value = JSON.parse(JSON.stringify(details));
		for (let attribute in value) {
			if (attribute === "_uuidNew") {
				value._uuid = value._uuidNew;
				delete value._uuidNew;
			}
			
			if (attribute === "_parentNew" && type === "group") {
				value._parent = value._parentNew;
				delete value._parentNew;
			}
		}
		
		await this.setState(type, identity, value);
	}
	
	async getState (type, identity) {
		var identityString = identifier.identityToString(type, identity);
		if (typeof this.state[type][identityString] === "undefined") {
			var loadCommand = this.identityToLoadCommand(type, identity);
			var item = await this.sender.send(loadCommand[0], loadCommand[1]);
			if (item._success === true) {
				let validatorClass = userInterfaces[convertor.convertCamelCaseToSS(type)];
				if (validatorClass.validateItem(item) === true) {
					this.state[type][identityString] = item;
				} else {
					throw `Invalid item: ["${type}", "${identityString}"]`;
				}
			} else if (item._success === false) {
				throw `Item not found: ["${type}", "${identityString}"]`;
			}
		}
		
		return [type, identityString];
	}
	
	async setState (type, identity, value) {
		var identityString = identifier.identityToString(type, identity);
		if (typeof this.state[type][identityString] === "undefined") {
			if (value._remove === true) throw "Unable to remove item that does not exist";
			var loadCommand = this.identityToLoadCommand(type, identity);
			var item = await this.sender.send(loadCommand[0], loadCommand[1]);
			if (item._success === false) {
				item = JSON.parse(JSON.stringify(this.defaults[type]));
				item._type = type;
				item._add = true;
			}
		} else {
			if (value._add === true) throw "Unable to add item that already exists";
			item = this.state[type][identityString];
		}
		
		if (value._removeItem === true) {
			delete this.state[type][identityString];
			return [type, identityString];
		}
		
		if (value._removeAdd === true) {
			delete item._add;
		}
		
		if (value._removeRemove === true) {
			delete item._remove;
		}
		
		delete value._removeItem;
		delete value._removeAdd;
		delete value._removeRemove;
		
		for (let attribute in value) {
			if (!(item[attribute] === value[attribute])) {
				item[attribute] = value[attribute];
				if (!(item._add === true || item._remove === true)) item._save = true;
			}
		}
		
		let validatorClass = userInterfaces[convertor.convertCamelCaseToSS(type)];
		if (validatorClass.validateItem(item) === true) {
			item._success = true;
			this.state[type][identityString] = item;
		} else {
			throw "Invalid item";
		}
		
		return [type, identityString];
	}
	
	async syncWithServer () {
		this.sender.clearCache();
		
		// Escape double quotes
		const delimit = input => input.split(`"`).join(`\\"`);
		
		for (let type in this.state) {
			for (let identityString in this.state[type]) {
				const item = this.state[type][identityString];
				if (item._add === true || item._remove === true) {
					if (item._add === true) {
						if (item._type === "object") {
							this.sender.push(`add_${type}`, `("${delimit(item._uuid)}")`);
						} else if (item._type === "group") {
							this.sender.push(`add_${type}`, `("${delimit(item._uuid)}", "${delimit(item._parent)}")`);
						} else if (item._type === "link") {
							this.sender.push(`add_${type}`, `("${delimit(item._uuid)}", "${delimit(item._start)}", "${delimit(item._end)}", ${item._direction})`);
						} else if (item._type === "property") {
							this.sender.push(`add_${type}`, `("${delimit(item._uuid)}", "${delimit(item._parent)}", "${delimit(item._name)}", "${delimit(item._content)}")`);
						}
						
						this.sender.pushCallback(
							(function () {
								delete item._add;
							}).bind(this)
						);
					}
					
					if (item._remove === true) {
						if (item._type === "object") {
							this.sender.push(`remove_${type}`, `("${delimit(item._uuid)}")`);
						} else if (item._type === "group") {
							this.sender.push(`remove_${type}`, `("${delimit(item._uuid)}", "${delimit(item._parent)}")`);
						} else if (item._type === "link") {
							this.sender.push(`remove_${type}`, `("${delimit(item._uuid)}")`);
						} else if (item._type === "property") {
							this.sender.push(`remove_${type}`, `("${delimit(item._uuid)}")`);
						}
						
						this.sender.pushCallback(
							(function () {
								delete this.state[type][identifier.identityToString(type, item)];
							}).bind(this)
						);
					}
				} else if (item._save === true) {
					const identity = identifier.identityFromString(type, identityString);
					if (item._type === "object") {
						this.sender.push(`save_${type}`, `("${delimit(identity._uuid)}", "${delimit(item._uuid)}")`);
					} else if (item._type === "group") {
						this.sender.push(`save_${type}`, `("${delimit(identity._uuid)}", "${delimit(item._uuid)}", "${delimit(identity._parent)}", "${delimit(item._parent)}")`);
					} else if (item._type === "link") {
						this.sender.push(`save_${type}`, `("${delimit(identity._uuid)}", "${delimit(item._uuid)}", "${delimit(item._start)}", "${delimit(item._end)}", ${item._direction})`);
					} else if (item._type === "property") {
						this.sender.push(`save_${type}`, `("${delimit(identity._uuid)}", "${delimit(item._uuid)}", "${delimit(item._parent)}", "${delimit(item._name)}", "${delimit(item._content)}")`);
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
		
		this.sender.push(`undefine`, `()`);
		if (await this.sender.execute() === true) {
			this.clientOnlyMode = false;
			return true;
		} else {
			throw "Unable to execute script";
		}
	}
}