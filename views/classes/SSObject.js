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
	
	validate (editor) {
		const uuid = editor.uuid;
		if (this.state._type !== "object") return false;
		if (this.state._uuid !== uuid) return false;
		return true;
	}
}