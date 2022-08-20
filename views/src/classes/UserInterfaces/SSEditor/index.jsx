import SSExpander from "../../SSExpander.js";
import SSListener from "../../SSListener.js";
import SSWindow from "../../SSWindow.jsx";
import SSItemSelected from "../../SSItemSelected.js";

import * as convertor from "../../../scripts/convertor.js";
import * as identifier from "../../../scripts/identifier.js";

import * as React from "react";

export const SSEditorContext = React.createContext();

export default class SSEditor {
	constructor (identityString) {
		// The head identity string of the class instance
		identifier.assertIdentityStringLength(8, identityString);
		this.identityString = identityString;
		
		this.selected = new SSItemSelected(identityString);
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		// First, get the dependencies of the editor using the editor's head identity string as the key (despite one being an identity string and the another being a key, they can be used interexchangably here because we asserted the length of the identity string in the constructor)
		var dependencies = await SSExpander.expand(this.identityString);
		window.assembly.clientOnlyMode = true;
		
		// Then, for each dependency, load the element that corresponds to it
		this.state = {};
		for (let array in dependencies) {
			this.state[array] = [];
			for (let item of dependencies[array]) {
				const type = array.split("_")[0];
				if (array === "group_uuid") {
					this.state[array].push(
						await window.assembly.getState(type, {
							_uuid: this.identityString, 
							_parent: item._parent
						})
					);
				} else if (array === "group_parent") {
					this.state[array].push(
						await window.assembly.getState(type, {
							_uuid: item._uuid, 
							_parent: this.identityString
						})
					);
				} else {
					this.state[array].push(
						await window.assembly.getState(type, {
							_uuid: item._uuid
						})
					);
				}
			}
		}
		
		let orderOfArrays = ["group_parent", "object_uuid", "group_uuid", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent", "property_name", "property_content"];
		let renderOutput = [];
		
		for (const array of orderOfArrays) {
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
				
				if (array === "group_uuid" && index === 0) {
					arrayOutput.push(": ");
				}
				
				if (array.split("_")[0] === "link" || array.split("_")[0] === "property") arrayOutput.push(<br key={`${action.windowString}>${type}_${identityString}_br`}/>);
				
				const userInterface = convertor.convertCamelCaseToSS(type);
				const windowString = `${action.windowString}>${type}_${identityString}_item`;
				const ref = React.createRef();
				
				/*
				
				Uses of variables or props named templateThis throughout the entire codebase: 
					1. When loading a user interface, know which element should be replaced by an SSThis element
					2. When selecting an element, know the identityString of the parent window to put in the action object when calling the dispatch function in the SSListener class
				
				*/
				arrayOutput.push(<SSWindow identityString={identityString} key={windowString} windowString={windowString} selectedWindow={action.selectedWindow} setSelectedWindow={action.setSelectedWindow} setSelectedWindowWithRef={action.setSelectedWindow(windowString, ref)} ref={ref} loadAs={userInterface} selectedObject={this.selected.selected} templateThis={templateThis}/>);
				
				if ((array === "group_uuid" || array === "object_uuid" || array === "group_parent") && index + 1 < this.state[array].length) arrayOutput.push(", ");
				
				if (array === "group_parent" && index === this.state[array].length - 1) {
					arrayOutput.push(": ");
				}
			}
			
			renderOutput = [...renderOutput, ...arrayOutput];
		}
		
		return (<span>
			<SSEditorContext.Provider value={action => SSListener.dispatch(this.selected, action)}>{renderOutput}</SSEditorContext.Provider><br/><br/>
			
			Selected Element: [<span>{this.selected.selectedString}</span>]
			<button onClick={() => this.selected.add()}>(+)</button>
			<button onClick={() => this.selected.remove()}>(-)</button><br/>
			
			Insert an Item: <span style={{
				verticalAlign: "top", 
				display: "inline-block"
			}}>
				#%%%%%%%%<button onClick={() => this.selected.add("group_parent")}>(+)</button>: 
				#%%%%%%%%<button onClick={() => this.selected.add("object_uuid")}>(+)</button> this: 
				#%%%%%%%%<button onClick={() => this.selected.add("group_uuid")}>(+)</button><br/>
				
				#%%%%%%%%<button onClick={() => this.selected.add("link_uuid")}>(+)</button>: 
				#%%%%%%%%<button onClick={() => this.selected.add("link_start")}>(+)</button> &lt;-&gt; 
				#%%%%%%%%<button onClick={() => this.selected.add("link_end")}>(+)</button><br/>
				
				#%%%%%%%%<button onClick={() => this.selected.add("property_uuid")}>(+)</button>: 
				#%%%%%%%%<button onClick={() => this.selected.add("property_parent")}>(+)</button>: 
				%%%%%%%%: <br/>
				%%%%%%%%
			</span>
		</span>);
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
		return true;
	}
	
	async validate (identityString) {
		return true;
	}
}