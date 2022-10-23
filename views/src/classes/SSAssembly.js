import SSSender from "./SSSender.js";

import * as userInterfaces from "./UserInterfaces/All.js";
import * as convertor from "../scripts/convertor.js";
import * as identifier from "../scripts/identifier.js";
import * as generator from "../scripts/generator.js";

export default class SSAssembly {
	constructor () {
		this.sender = new SSSender();
		
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
	
	/*
	
	When generateKeys is used, new objects will be automatically added with the generated keys. But if generateKeys is used to update the _uuid of an object, the _uuid of the original object is supposed to be updated into the generated key, so no new object should be added. In this case, set suppressObjectAddition to true
	
	*/
	async generateKeys (details, suppressObjectAddition = false) {
		let generateKeyCodeLibrary = [];
		for (let attribute in details) {
			if (typeof details[attribute] === "object" && typeof details[attribute].generateKeyCode === "number") {
				if (typeof generateKeyCodeLibrary[details[attribute].generateKeyCode] === "undefined") {
					const key = generator.generateKey();
					generateKeyCodeLibrary[details[attribute].generateKeyCode] = key;
					
					// If suppressObjectAddition is set to true, the new object would be added, and then immediately removed. The reason why the adding is still necessary is because it is the adding that checks whether the generated key is already used by another item or not
					await this.setState("object", {_uuid: key}, {_uuid: key});
					if (suppressObjectAddition === true) {
						await this.setState("object", {_uuid: key}, {_uuid: key, _removeItem: true});
					}
				}
				
				details[attribute] = generateKeyCodeLibrary[details[attribute].generateKeyCode];
			}
		}
		
		return details;
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
			return true;
		} else {
			throw "Unable to execute script";
		}
	}
}