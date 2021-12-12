import SSAssembly from "../SSAssembly.js";
import SSPackaging from "../SSPackaging.js";

export default class SSEditor {
	constructor (uuid, send) {
		// The head UUID of the Editor class instance
		this.uuid = uuid;
		
		this.send = send;
		this.assembly = new SSAssembly();
		this.packaging = new SSPackaging(send);
		this.state = {};
	}
	
	async add (assembly = this.assembly, action = {}) {
		// First, get the dependencies of the editor with the UUID as the editor's head
		var dependencies = await this.packaging.check(this.uuid);
		
		// Then, for each dependency, load the element that corresponds to it
		for (let array in dependencies) {
			this.state[array] = [];
			for (let item of dependencies[array]) {
				const type = array.split("_")[0];
				if (array === "group_uuid") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: this.uuid, 
							_parent: item
						})
					);
				} else if (array === "group_parent") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item, 
							_parent: this.uuid
						})
					);
				} else {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item
						})
					);
				}
			}
		}
		
		this.dependenciesLoaded = true;
		return assembly;
	}
	
	async load (assembly = this.assembly, action = {}) {
		if (await this.validate(this) === true) {
			let orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
			
			let itemAddRemove = function (item, array, index, attribute) {
				output = "";
				if (item.state._add === true) output += " <${SSAdd} id=\"" + array + "_" + index + attribute + "\" red=\"0\"/>";
				if (item.state._remove === true) output += " <${SSRemove} id=\"" + array + "_" + index + attribute + "\" red=\"0\"/>";
				return output;
			}
			
			for (var i = 0; i < orderOfArrays.length; i++) {
				const array = orderOfArrays[i];
				if (!(this.state[array])) continue;
				
				for (let index = 0; index < this.state[array].length; index++) {
					const type = this.state[array][index][0];
					const identityString = this.state[array][index][1];
					console.log(this.assembly.state[type][identityString]);
				}
			}
			
			return true;
		}
	}
	
	async save (assembly = this.assembly, action = {}) {
		return assembly;
	}
	
	async remove (assembly = this.assembly, action = {}) {
		return assembly;
	}
	
	async validate () {
		return true;
	}
}