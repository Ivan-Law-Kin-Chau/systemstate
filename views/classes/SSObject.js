import {isValidKey, isValidDirection, isValidSingleLineString, isValidMultiLineString} from "../scripts/validator.js";

export default class SSObject {
	constructor (state) {
		this.state = state;
	}
	
	add (editor) {
		// Do something
		return editor;
	}
	
	load (editor, action) {
		this.validate(editor);
		var userInterface = true;
		return userInterface;
	}
	
	save (editor, action) {
		// Do something
		return editor;
	}
	
	remove (editor) {
		// Do something
		return editor;
	}
	
	validate () {
		if (this.state._type !== "object") return false;
		if (!(isValidKey(this.state._uuid))) return false;
		return true;
	}
}