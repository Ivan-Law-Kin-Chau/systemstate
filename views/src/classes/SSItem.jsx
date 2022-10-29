import * as elements from "./Elements/All.js";
import * as validator from "../scripts/validator.js";

import * as React from "react";

export default class SSItem {
	static isSSItem (props) {
		if (typeof props.selectedObject !== "object") return false;
		if (typeof props.headAttribute !== "string") return false;
		return true;
	}
	
	static isSSObject (item) {
		if (item._table !== "object") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		return true;
	}
	
	static isSSGroup (item) {
		if (item._table !== "group") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		if (!validator.isValidKey(item._parent)) return false;
		return true;
	}
	
	static isSSLink (item) {
		if (item._table !== "link") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		if (!validator.isValidKey(item._start)) return false;
		if (!validator.isValidKey(item._end)) return false;
		if (!validator.isValidDirection(item._direction)) return false;
		return true;
	}
	
	static isSSProperty (item) {
		if (item._table !== "property") return false;
		if (!validator.isValidKey(item._uuid)) return false;
		if (!validator.isValidKey(item._parent)) return false;
		if (!validator.isValidSingleLineString(item._name)) return false;
		if (!validator.isValidMultiLineString(item._content)) return false;
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