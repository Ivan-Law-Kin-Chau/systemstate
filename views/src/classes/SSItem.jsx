import * as validator from "../scripts/validator.js";

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
}