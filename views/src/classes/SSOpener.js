import * as userInterfaces from "./UserInterfaces/All.js";

export default class SSOpener {
	constructor (assembly, selected, listener) {
		this.assembly = assembly;
		this.selected = selected;
		this.listener = listener;
	}
	
	async read (url) {
		return new Promise ((resolve, reject) => {
			var terminal = new XMLHttpRequest();
			terminal.onreadystatechange = async function () {
				if (this.readyState == 4 && this.status == 200) {
					resolve(this.responseText);
				}
			}
			terminal.open("GET", "http://localhost:800/" + url, true);
			terminal.send();
		});
	}
	
	/*
	
	openUuid loops through the array of all user interfaces available, 
	and runs the validate function of each user interface, 
	then renders the first one whose validate function returned true. 
	SSEditor will the the last user interface, 
	and its validate function will always return true, 
	so if the validate functions of all other user interfaces returned false, 
	SSEditor will be the user interface used in the end. 
	
	*/
	async openUuid (uuid) {
		for (const userInterface in userInterfaces) {
			const loadedClass = userInterfaces[userInterface];
			const loadedClassInstance = new loadedClass(uuid, this.assembly, this.selected, this.listener);
			if (await loadedClassInstance.validate(this.assembly, uuid) === true) {
				this.selected.openedUuid = uuid;
				return await loadedClassInstance.load();
			} else {
				continue;
			}
		}
		
		// If loadedClassInstance.load() is called, the loadedClass will update the outputElement
		// But if there is no loadedClass, we will remove the outputElement here
		window.selected.updateOutputElement(null);
		return false;
	}
	
	async getClass (name) {
		for (const userInterface in userInterfaces) {
			const loadedClass = userInterfaces[userInterface];
			if (userInterface === name) {
				const loadedClass = userInterfaces[userInterface];
				return loadedClass;
			}
		}
		
		throw "User interface class is unavailable: " + name;
	}
}