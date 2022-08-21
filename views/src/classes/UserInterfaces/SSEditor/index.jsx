import WindowSpan from "./WindowSpan.jsx";

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
		this.identityString = identityString;
		
		this.state = {};
	}
	
	async add (action = {}) {
		return true;
	}
	
	async load (action = {}) {
		/*
		
		If this SSEditor window is rendered in the place of a SSGroup window, its identityString is going to be 17 characters long instead of 8. In this case, use the templateThis prop to decide whether the SSGroup's _uuid or its _parent will be used as the head identity string of this SSEditor window (because the SSEditor window can only handle head identity strings that are 8 characters long instead of 17)
		
		*/
		(() => {
			try {
				identifier.assertIdentityStringLength(8, this.identityString);
			} catch (errorString) {
				if (errorString !== "Identity string length is not 8") throw errorString;
				identifier.assertIdentityStringLength(17, this.identityString);
				if (action.defaultUserInterface === "SSGroup") {
					if (action.templateThis === "uuid") {
						this.identityString = identifier.identityFromString("group", this.identityString)._uuid;
					} else if (action.templateThis === "parent") {
						this.identityString = identifier.identityFromString("group", this.identityString)._parent;
					} else {
						throw "SSEditor template this invalid";
					}
				} else {
					throw "SSEditor identity string invalid";
				}
			} finally {
				if (typeof this.selected === "undefined") this.selected = new SSItemSelected(this.identityString);
			}
		})();
		
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
				const keyPrefix = `${action.windowString}>${type}_${identityString}`;
				
				if (array === "group_uuid" && index === 0) {
					arrayOutput.push(<WindowSpan key={`${keyPrefix}_colon_start`}>: </WindowSpan>);
				}
				
				if (array.split("_")[0] === "link" || array.split("_")[0] === "property") arrayOutput.push(<br key={`${keyPrefix}_br`}/>);
				
				const userInterface = convertor.convertCamelCaseToSS(type);
				const windowString = `${keyPrefix}_item`;
				const ref = React.createRef();
				
				/*
				
				Uses of variables or props named templateThis throughout the entire codebase: 
					1. When loading a user interface, know which element should be replaced by an SSThis element
					2. When selecting an element, know the identityString of the parent window to put in the action object when calling the dispatch function in the SSListener class
				
				*/
				arrayOutput.push(<SSWindow identityString={identityString} key={windowString} windowString={windowString} selectedWindow={action.selectedWindow} setSelectedWindow={action.setSelectedWindow} setSelectedWindowWithRef={action.setSelectedWindow(windowString, ref)} ref={ref} defaultUserInterface={userInterface} selectedObject={this.selected.selected} templateThis={templateThis}/>);
				
				if ((array === "group_uuid" || array === "object_uuid" || array === "group_parent") && index + 1 < this.state[array].length) arrayOutput.push(<WindowSpan key={`${keyPrefix}_comma`}>, </WindowSpan>);
				
				if (array === "group_parent" && index === this.state[array].length - 1) {
					arrayOutput.push(<WindowSpan key={`${keyPrefix}_colon_end`}>: </WindowSpan>);
				}
			}
			
			renderOutput = [...renderOutput, ...arrayOutput];
		}
		
		/*
		
		The SSElements within this SSEditor have to call a dispatch function that affects this.selected here. Since the SSElements are descendant components of SSEditor, for the dispatch function to be able to affect this.selected, the dispatch function has to be created here and passed down all the way to the SSElements as a prop. Yet, between this SSEditor and the SSElements, there are many levels of components in the virtual DOM (from ancestors to descendants: SSEditor, SSWindow, SSItem, and then the actual SSElement that uses the dispatch function, respectively). Hence, to avoid prop drilling, a React context is created here with the dispatch function as the context provider's value, so that the SSElement can just use a context consumer to gain access to the dispatch function directly, without any prop drilling
		
		*/
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
	
	async validate (identityString, action = {}) {
		return true;
	}
}