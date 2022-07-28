import SSExpander from "../../SSExpander.js";

import * as items from "../../Items/All.js";
import * as convertor from "../../../scripts/convertor.js";

import * as React from "react";

export const SSUserInterface = React.createContext();

export default class SSEditor {
	constructor (uuid, assembly, selected, listener) {
		// The head UUID of the class instance
		this.uuid = uuid;
		
		this.assembly = assembly;
		this.selected = selected;
		this.listener = listener;
		this.expander = new SSExpander(this.assembly);
		this.state = {};
		this.loaded = false;
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		// First, get the dependencies of the editor with the UUID as the editor's head
		var dependencies = await this.expander.expand(this.uuid); // The SSExpander class fetches the data from the server instead of the SSAssembly class, making it necessary to run the syncWithServer function before every rerender
		
		// Then, for each dependency, load the element that corresponds to it
		for (let array in dependencies) {
			this.state[array] = [];
			for (let item of dependencies[array]) {
				const type = array.split("_")[0];
				if (array === "group_uuid") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: this.uuid, 
							_parent: item._parent
						})
					);
				} else if (array === "group_parent") {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item._uuid, 
							_parent: this.uuid
						})
					);
				} else {
					this.state[array].push(
						await this.assembly.getState(type, {
							_uuid: item._uuid
						})
					);
				}
			}
		}
		
		let orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
		let renderOutput = [];
		
		for (var i = 0; i < orderOfArrays.length; i++) {
			const array = orderOfArrays[i];
			if (!(this.state[array])) continue;
			let arrayOutput = [];
			
			let templateType = array.split("_")[0];
			let templateThis = array.split("_")[1];
			
			if (templateType === "group") {
				if (templateThis === "uuid") {
					templateThis = "parent";
				} else if (templateThis === "parent") {
					templateThis = "uuid";
				}
			}
			
			for (let index = 0; index < this.state[array].length; index++) {
				const type = this.state[array][index][0];
				const identityString = this.state[array][index][1];
				
				if (array === "group_uuid" && arrayOutput !== [] && index === 0) {
					arrayOutput.push(": ");
				}
				
				if (array.split("_")[0] === "link" || array.split("_")[0] === "property") arrayOutput.push(<br key={type + "_" + identityString + "_br"}/>);
				
				const Item = items[convertor.convertCamelCaseToSS(type)];
				arrayOutput.push(<Item key={type + "_" + identityString + "_item"} identityString={identityString} selectedObject={this.selected.selected} templateThis={templateThis} assembly={this.assembly}/>);
				
				if ((array === "group_uuid" || array === "object_uuid" || array === "group_parent") && index + 1 < this.state[array].length) arrayOutput.push(", ");
				
				if (array === "group_parent" && arrayOutput !== [] && index === this.state[array].length - 1) {
					arrayOutput.push(": ");
				}
			}
			
			renderOutput = [...renderOutput, ...arrayOutput];
		}
		
		return (<div>
			<SSUserInterface.Provider value={action => this.listener.dispatch(action)}>{renderOutput}</SSUserInterface.Provider><br/><br/>
			
			Selected Element: [<span>{window.selected.selectedString}</span>]
			<span className="white" onClick={() => window.selected.add()}>(+)</span>
			<span className="white" onClick={() => window.selected.remove()}>(-)</span><br/>
			
			Insert an Item: <span style={{verticalAlign: "top", display: "inline-block"}}>
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("group_parent")}>(+)</span>: 
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("object_uuid")}>(+)</span> this: 
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("group_uuid")}>(+)</span><br/>
			
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("link_uuid")}>(+)</span>: 
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("link_start")}>(+)</span> &lt;-&gt; 
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("link_end")}>(+)</span><br/>
			
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("property_uuid")}>(+)</span>: 
			#%%%%%%%%<span className="white" onClick={() => window.selected.add("property_parent")}>(+)</span>: 
			%%%%%%%%: <br/>
			%%%%%%%%
			</span>
		</div>);
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
		return true;
	}
	
	async validate (assembly, uuid) {
		return true;
	}
}