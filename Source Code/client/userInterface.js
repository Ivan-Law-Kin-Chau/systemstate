preloader = new XMLHttpRequest();
preloader.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		settings = JSON.parse(this.responseText);
	}
}
preloader.open("POST", "resources/settings.json", false);
preloader.send();

document.addEventListener("DOMContentLoaded", event => {
	softwareVersion = "Systemstate Editor Pre-alpha v0.3.1";
	hotkeys = {
		"enter": {
			"keyCode": 13, 
			"keyStatus": 0
		}, 
		"shift": {
			"keyCode": 16, 
			"keyStatus": 0
		}, 
		"ctrl": {
			"keyCode": 17, 
			"keyStatus": 0
		}, 
		"alt": {
			"keyCode": 18, 
			"keyStatus": 0
		}, 
		"up": {
			"keyCode": 38, 
			"keyStatus": 0
		}, 
		"down": {
			"keyCode": 40, 
			"keyStatus": 0
		}, 
		"one": {
			"keyCode": 49, 
			"keyStatus": 0
		}, 
		"two": {
			"keyCode": 50, 
			"keyStatus": 0
		}, 
		"three": {
			"keyCode": 51, 
			"keyStatus": 0
		}, 
		"four": {
			"keyCode": 52, 
			"keyStatus": 0
		}
	};
	currentlyOpened = null;
	traceCache = [];
	lastForm = false;
	
	tabsManager = tabsHandler();
	fileManager = fileHandler();
	queryBarManager = queryBarHandler();
	searchBarManager = searchBarHandler();
	
	document.getElementById("queryForm").addEventListener("submit", function(event) {
		event.preventDefault();
		if (hotkeys.enter.keyStatus != 2) {
			queryBarManager.query(document.getElementById("query").value);
		}
		return false;
	});
	
	document.getElementById("searchForm").addEventListener('submit', function(event) {
		event.preventDefault();
		if (hotkeys.enter.keyStatus != 2) {
			searchBarManager.end();
		}
		return false;
	});
	
	document.addEventListener("keydown", event => {
		for (keyName in hotkeys) {
			if (hotkeys[keyName].keyCode == event.keyCode) {
				if (hotkeys[keyName].keyStatus == 0) {
					hotkeys[keyName].keyStatus = 1;
				}
			}
		}
	});
	
	document.addEventListener("keyup", event => {
		tabsManager.navigateTabs();
		queryBarManager.navigateHistory();
		searchBarManager.wrapper();
		for (keyName in hotkeys) {
			if (hotkeys[keyName].keyCode == event.keyCode) {
				hotkeys[keyName].keyStatus = 0;
			}
		}
	});
	
	
	document.addEventListener("mousedown", event => {
		if (document.activeElement) {
			parentChaser = document.activeElement;
			while (parentChaser) {
				parentChaser = parentChaser.parentNode;
				if (parentChaser) {
					if (parentChaser.tagName == "FORM") {
						lastForm = parentChaser.id;
					}
				}
			}
		}
	});
	
	document.getElementById("enterButton").addEventListener('click', function(event) {
		if (lastForm) {
			original = hotkeys.shift.keyStatus;
			event = new Event("submit", {
				"cancelable": true
			});
			hotkeys.shift.keyStatus = 1;
			document.getElementById(lastForm).dispatchEvent(event);
			hotkeys.shift.keyStatus = original;
			lastForm = false;
		}
	});
	
	prepareGraphicalUI();
	render();
	read("init.txt");
	setStatusMessage();
	document.title = softwareVersion;
	document.getElementById("query").focus();
	
	initEditor = settings.client.editor;
	initTab = settings.client.tab;
	initDevice = settings.client.device;
	
	parseGetSpawner = parseGet();
	for (parseGetVariable in parseGetSpawner) {
		this[parseGetVariable] = parseGetSpawner[parseGetVariable];
	}
	
	if (initEditor != null) {
		load(initEditor);
	}
	
	if (initTab != null) {
		if (initTab == "Console") {
			tabsManager.setCurrentTab(1);
		} else if (initTab == "Search") {
			tabsManager.setCurrentTab(2);
		} else if (initTab == "JSON") {
			tabsManager.setCurrentTab(3);
		} else if (initTab == "GUI") {
			tabsManager.setCurrentTab(4);
		}
	}
	
	if (initDevice != null) {
		if (initDevice == "Mobile") {
			document.getElementById("enterButton").style.display = "initial";
			document.getElementById("pipe").style.display = "initial";
		} else if (initDevice == "Desktop") {
			document.getElementById("enterButton").style.display = "none";
			document.getElementById("pipe").style.display = "none";
		}
	}
});

visitKey = function(key) {
	if (hotkeys.shift.keyStatus == 1) {
		hotkeys.shift.keyStatus = 2;
		document.activeElement.selectionStart = 0;
		document.activeElement.selectionEnd = document.activeElement.value.length;
		load(key);
	}
}

noContentRender = function(elementId) {
	if (document.getElementById(elementId).innerHTML == "") {
		document.getElementById(elementId).innerHTML = "No Content";
		document.getElementById(elementId).classList.add("unselectable");
	} else if (document.getElementById(elementId).innerHTML != "No Content") {
		document.getElementById(elementId).classList.remove("unselectable");
	}
}

render = function(input = null) {
	if (input != null) {
		reduxStore.dispatch({
			"type": "EDITOR_RESET", 
			"editor": input
		});
	}
	noContentRender("searchSuggestions");
	noContentRender("sidebar");
	noContentRender("sidebarPreview");
	noContentRender("gui");
}

read = function(target) {
	terminalFunction(function(responseText) {
		this.responseText = responseText;
		trace(this.responseText);
	}, null, "resources/" + target);
}

setStatusMessage = function(statusMessage = "") {
	if (statusMessage == "") {
		document.getElementById("version").innerHTML = softwareVersion;
	} else {
		document.getElementById("version").innerHTML = softwareVersion + " - " + statusMessage;
	}
}

parseGet = function() {
	output = {};
	getArray = window.location.search.substr(1).split("&");
	for (i = 0; i < getArray.length; i++) {
		output[getArray[i].split("=")[0]] = getArray[i].split("=")[1];
	}
	return output;
}

terminalFunction = function(responseFunction, query = "", target = "http://localhost:" + settings.server.port + "/terminal") {
	terminal = new XMLHttpRequest();
	terminal.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			responseFunction(this.responseText);
			render(null);
		}
	}
	terminal.open("POST", target, true);
	if (query === null) {
		terminal.send();
	} else {
		terminal.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		terminal.send("query=" + encodeURIComponent(query));
	}
}

terminate = function() {
	serverTerminated = 0;
	queryBarManager.query(`terminate();`, `system`, ``, 0);
	window.setInterval(function() {
		if (serverTerminated == 0) {
			terminalFunction(function(responseText) {
				this.responseText = responseText;
				serverTerminated = false;
			}, "");
			serverTerminated = 1;
		} else if (serverTerminated == 1) {
			trace("Success: Server terminated");
			serverTerminated = 2;
		}
	}, 3000);
}

prepareGraphicalUI = function() {
	window.guiWidgets = document.getElementById("gui").innerHTML;
	window.guiWidgets = window.guiWidgets.split("\n");
	window.guiWidgets = window.guiWidgets.join("");
	window.guiWidgets = window.guiWidgets.split("<br>");
	window.guiWidgets = window.guiWidgets.join("\n");
	document.getElementById("gui").innerHTML = window.guiWidgets;
}