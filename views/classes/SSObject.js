export default class SSObject {
	constructor (data) {
		this.data = data;
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
		return true;
	}
}