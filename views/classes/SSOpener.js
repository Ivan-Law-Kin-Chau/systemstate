export default class SSOpener {
	constructor (assembly, selected) {
		this.assembly = assembly;
		this.selected = selected;
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
		this.state = JSON.parse(await this.read("classes/UserInterfaces/settings.json"));
		for (let i = 0; i < this.state.userInterfaceList.length; i++) {
			const loadedClass = await import("./UserInterfaces/SS" + this.state.userInterfaceList[i] + "/index.js");
			const loadedClassInstance = new (loadedClass.default)(uuid, this.assembly, this.selected);
			if (await loadedClassInstance.validate(this.assembly, uuid) === true) {
				return await loadedClassInstance.load();
			} else {
				continue;
			}
		}
	}
	
	async getClass (name) {
		this.state = JSON.parse(await this.read("classes/UserInterfaces/settings.json"));
		for (let i = 0; i < this.state.userInterfaceList.length; i++) {
			if (this.state.userInterfaceList[i] === name) {
				return (await import("./UserInterfaces/SS" + this.state.userInterfaceList[i] + "/index.js")).default;
			}
		}
		
		throw "User interface class is unavailable: " + name;
	}
}