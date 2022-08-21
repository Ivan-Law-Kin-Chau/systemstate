import * as elements from "./Elements/All.js";

import * as React from "react";

export default class SSItem {
	static isSSItem (props) {
		if (typeof props.selectedObject !== "object") return false;
		if (typeof props.headAttribute !== "string") return false;
		return true;
	}
	
	static isRed (renderState, action = "_element") {
		if (renderState.selectedObject.array === null) return false;
		if (renderState.item._type !== renderState.selectedObject.array.split("_")[0]) return false;
		if (renderState.identityString !== renderState.selectedObject.identityString) return false;
		if (action !== renderState.selectedObject.action) return false;
		return true;
	}
	
	static itemAddRemove (renderState) {
		const SSAdd = elements["SSAdd"];
		const SSRemove = elements["SSRemove"];
		
		return (<>
			{renderState.item._add === true ? <>
				{"\u00a0"}<SSAdd type={renderState.item._type} headAttribute={renderState.headAttribute} id={renderState.identityString} red={SSItem.isRed(renderState, "_add")}/>
			</> : ""}
			
			{renderState.item._remove === true ? <>
				{"\u00a0"}<SSRemove type={renderState.item._type} headAttribute={renderState.headAttribute} id={renderState.identityString} red={SSItem.isRed(renderState, "_remove")}/>
			</> : ""}
		</>);
	}
}