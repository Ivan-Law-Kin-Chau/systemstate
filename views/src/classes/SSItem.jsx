import * as elements from "./Elements/All.js";

import * as React from "react";

export default class SSItem {
	static isSSItem (props) {
		if (typeof props.selectedObject !== "object") return false;
		if (typeof props.headAttribute !== "string") return false;
		return true;
	}
	
	static isRed (renderState, action = "_element") {
		if (renderState.selectedObject.relationship === null) return false;
		if (renderState.item._table !== renderState.selectedObject.relationship.split("_")[0]) return false;
		if (renderState.identityString !== renderState.selectedObject.identityString) return false;
		if (action !== renderState.selectedObject.action) return false;
		return true;
	}
	
	static itemAddRemove (renderState) {
		const SSAdd = elements["SSAdd"];
		const SSRemove = elements["SSRemove"];
		
		return (<>
			{renderState.item._add === true ? <>
				{"\u00a0"}<SSAdd table={renderState.item._table} headAttribute={renderState.headAttribute} id={renderState.identityString} red={SSItem.isRed(renderState, "_add")}/>
			</> : ""}
			
			{renderState.item._remove === true ? <>
				{"\u00a0"}<SSRemove table={renderState.item._table} headAttribute={renderState.headAttribute} id={renderState.identityString} red={SSItem.isRed(renderState, "_remove")}/>
			</> : ""}
		</>);
	}
}