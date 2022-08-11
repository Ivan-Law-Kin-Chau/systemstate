import SSExpander from "../../SSExpander.js";

import * as elements from "../../Elements/All.js";

import * as React from "react";

export default class SSItem {
	constructor (identityString, assembly, selected, listener) {
		// The head identityString of the class instance
		this.identityString = identityString;
		
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
		console.error("The SSItem class is not supposed to be loaded as a standalone");
		return false;
	}
	
	async save (action = {}) {
		return true;
	}
	
	async remove (action = {}) {
		return true;
	}
	
	async validate (assembly, identityString) {
		return true;
	}
	
	getRed (renderState, action = "_element") {
		if (renderState.selectedObject.array === null) return false;
		if (renderState.item._type !== renderState.selectedObject.array.split("_")[0]) return false;
		if (renderState.identityString !== renderState.selectedObject.identityString) return false;
		if (action !== renderState.selectedObject.action) return false;
		return true;
	}
	
	itemAddRemove (renderState) {
		const SSAdd = elements["SSAdd"];
		const SSRemove = elements["SSRemove"];
		
		return (<>
			{renderState.item._add === true ? <>
				{"\u00a0"}<SSAdd templateType={renderState.item._type} templateThis={renderState.templateThis} id={renderState.identityString} red={this.getRed(renderState, "_add")}/>
			</> : ""}
			
			{renderState.item._remove === true ? <>
				{"\u00a0"}<SSRemove templateType={renderState.item._type} templateThis={renderState.templateThis} id={renderState.identityString} red={this.getRed(renderState, "_remove")}/>
			</> : ""}
		</>);
	}
}