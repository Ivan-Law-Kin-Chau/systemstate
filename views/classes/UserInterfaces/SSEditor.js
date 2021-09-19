import SSObject from "../SSObject.js";
import SSGroup from "../SSGroup.js";
import SSLink from "../SSLink.js";
import SSProperty from "../SSProperty.js";

export default class SSEditor {
	constructor (uuid, send) {
		this.uuid = uuid; // The head UUID of the Editor class instance
		this.state = {}; // All the other class instances will be stored here
		this.dependenciesLoaded = false; // Will become true after the loadDependencies method is called
		
		this.send = send;
	}
	
	async add (editor = {}) {
		// First, get the dependencies of the editor with the UUID as the editor's head
		var dependencies = await send("check(\"" + this.uuid + "\")");
		
		// Then, for each dependency, load the element that corresponds to it
		for (let array in dependencies) {
			this.state[array] = [];
			for (let item of dependencies[array]) {
				const type = array.split("_")[0];
				let loaded;
				if (array === "group_uuid") {
					loaded = await send("load_" + type + "(\"" + this.uuid + "\", \"" + item + "\")");
				} else if (array === "group_parent") {
					loaded = await send("load_" + type + "(\"" + item + "\", \"" + this.uuid + "\")");
				} else {
					loaded = await send("load_" + type + "(\"" + item + "\")");
				}
				let loadedClassInstance = eval("(new SS" + type[0].toUpperCase() + type.slice(1) + "(loaded))");
				if (loadedClassInstance.validate(this) === true) this.state[array].push(loadedClassInstance);
			}
		}
		this.dependenciesLoaded = true;
		
		return editor;
	}
	
	async load (editor = {}, action = {}) {
		if (this.validate(editor) === true) {
			// Get the UUID from action.uuid
			var userInterface = true;
			return userInterface;
		}
	}
	
	async save (editor = {}, action = {}) {
		return editor;
	}
	
	async remove (editor = {}) {
		return editor;
	}
	
	async validate () {
		return true;
	}
	
	itemAddRemove (item, array, index, attribute) {
		output = "";
		if (item.state._add === true) output += " <${SSAdd} id=\"" + array + "_" + index + attribute + "\" red=\"0\"/>";
		if (item.state._remove === true) output += " <${SSRemove} id=\"" + array + "_" + index + attribute + "\" red=\"0\"/>";
		return output;
	}
	
	render () {
		var orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
		
		for (var i = 0; i < orderOfArrays.length; i++) {
			const array = orderOfArrays[i];
			if (!(this.state[array])) continue;
			
			let index;
			for (const index = 0; index < this.state[array].length; index++) {
				
			}
		}
	}
}