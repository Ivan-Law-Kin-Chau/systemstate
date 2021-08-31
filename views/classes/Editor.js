import SSObject from "./SSObject.js";
import SSGroup from "./SSGroup.js";
import SSLink from "./SSLink.js";
import SSProperty from "./SSProperty.js";

export default class Editor {
	constructor (uuid) {
		this.uuid = uuid; // The head UUID of the Editor class instance
		this.editor = {}; // All the other class instances will be stored here
		this.dependenciesLoaded = false; // Will become true after the loadDependencies method is called
	}
	
	async loadDependencies (dependencies) {
		for (let array in dependencies) {
			this.editor[array] = [];
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
				this.editor[array].push(loadedClassInstance);
			}
		}
		this.dependenciesLoaded = true;
	}
}