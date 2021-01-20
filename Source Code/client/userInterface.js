preloader = new XMLHttpRequest();
preloader.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		settings = JSON.parse(this.responseText);
	}
}
preloader.open("POST", "resources/settings.json", true);
preloader.send();

document.addEventListener('DOMContentLoaded', event => {
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
	editor = null;
	valid = [];
	currentlyOpened = null;
	originallyOpened = null;
	mouseOnNode = false;
	recordedScript = null;
	unsavedScript = null;
	traceCache = [];
	selector();
	lastForm = false;
	
	tabsManager = tabsHandler();
	viewManager = viewHandler();
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
			event = new Event('submit', {
				"cancelable": true
			});
			hotkeys.shift.keyStatus = 1;
			document.getElementById(lastForm).dispatchEvent(event);
			hotkeys.shift.keyStatus = original;
			lastForm = false;
		}
	});
	
	graphicalUI();
	render();
	read("init.txt");
	setStatusMessage();
	document.title = softwareVersion;
	document.getElementById("query").focus();
	queryBarManager.query(`expand("%");`, `system`, `
		editor = JSON.parse(this.responseText);
		iterate(function(array, i) {
			valid[valid.length] = editor[array][i];
		}, "editor[array]");
		editor = null;
	`, 0);
	
	initEditor = settings.client.editor;
	initTab = settings.client.tab;
	initView = settings.client.view;
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
	
	if (initView != null) {
		if (initView == "Graph") {
			viewManager.setCurrentView(1);
		} else if (initView == "Split") {
			viewManager.setCurrentView(2);
		} else if (initView == "Editor") {
			viewManager.setCurrentView(3);
		}
	}
	
	if (initDevice != null) {
		if (initDevice == "Mobile") {
			document.getElementById("enterButton").style.display = "initial";
			document.getElementById("pipeOne").style.display = "initial";
		} else if (initDevice == "Desktop") {
			document.getElementById("enterButton").style.display = "none";
			document.getElementById("pipeOne").style.display = "none";
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

render = function(input = null, useD3 = true, holdInnerHTML = false) {
	if (input != null) {
		document.getElementById("sidebar").innerHTML = reload(input, useD3);
	}
	if (editor != null) {
		document.getElementById("sidebarPreview").innerHTML = JSON.stringify(editor, null, 4);
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

terminalFunction = function(responseFunction, query = "", target = "http://localhost:" + settings.server.port) {
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

graphicalUI = function() {
	window.uploaderManager = fileManager.export();
	window.guiWidgets = document.getElementById("gui").innerHTML;
	window.guiWidgets = window.guiWidgets.split("\n");
	window.guiWidgets = window.guiWidgets.join("");
	window.guiWidgets = window.guiWidgets.split("<br>");
	window.guiWidgets = window.guiWidgets.join("\n");
	document.getElementById("gui").innerHTML = window.guiWidgets;
}

selector = function(array = null, index = null, action = null, attribute = null) {
	canProceed = true;
	suppressGraphicalUI = false;
	if (editor == null || array == null) {
		suppressGraphicalUI = true;
		selected = {
			"array": null, 
			"index": null, 
			"action": null
		};
	} else if (typeof editor[array] != "undefined") {
		if (typeof window.selection.uncolor != "undefined") {
			window.selection.uncolor();
		}
		if (typeof editor[array][index] != "undefined") {
			selected = {
				"array": array, 
				"index": index, 
				"action": action
			};
			if (attribute !== null) {
				selected.attribute = attribute;
			}
			if (typeof window.selection != "undefined") {
				if (isSameObject({
					"array": selected.array, 
					"index": selected.index, 
					"action": selected.action
				}, {
					"array": window.selection.array, 
					"index": window.selection.index, 
					"action": window.selection.action
				}) == true) {
					document.getElementById("selected").innerHTML = "%%%%%%%%";
					window.selector();
					canProceed = false;
				}
			}
			if (canProceed == true) {
				loop = [selected.attribute];
				selected.uncolorTargetList = [];
				if (selected.action == "element") {
					if (array == "group_uuid") {
						loop[loop.length] = "_parent";
					} else if (array == "group_parent") {
						loop[loop.length] = "_uuid";
					} else {
						loop[loop.length] = "_" + array.split("_")[1];
					}
				}
				if (selected.action == "add") {
					loop[loop.length] = "_add";
				}
				if (selected.action == "remove") {
					loop[loop.length] = "_remove";
				}
				for (i = 0; i < loop.length; i++) {
					uncolorTarget = document.getElementById(selected.array + "_" + index + loop[i]) || null;
					if (uncolorTarget !== null) {
						selected.uncolorTargetList[selected.uncolorTargetList.length] = uncolorTarget;
						uncolorTarget.style.color = "#FF0000";
					}
				}
			}
		}
	}
	selected.uncolor = function() {
		if (typeof selected.uncolorTargetList != "undefined") {
			for (i = 0; i < selected.uncolorTargetList.length; i++) {
				if (document.getElementById(selected.uncolorTargetList[i].id) != null) {
					document.getElementById(selected.uncolorTargetList[i].id).style.color = "#000000";
				}
			}
		}
	}
	selected.recolor = function() {
		if (typeof selected.uncolorTargetList != "undefined") {
			for (i = 0; i < selected.uncolorTargetList.length; i++) {
				if (document.getElementById(selected.uncolorTargetList[i].id) != null) {
					document.getElementById(selected.uncolorTargetList[i].id).style.color = "#FF0000";
				}
			}
		}
	}
	selected.arrayIndexKey = function(array = null, index = null) {
		if (array == null) {
			array = selected.array;
		}
		if (index == null) {
			index = selected.index;
		}
		if (array == "group_uuid") {
			key = editor[array][index]["_parent"];
		} else if (array == "group_parent") {
			key = editor[array][index]["_uuid"];
		} else {
			key = editor[array][index]["_uuid"];
		}
		return {
			"array": array, 
			"index": index, 
			"key": key
		};
	}
	selected.add = function(array = null, index = null) {
		processArrayIndexKey = selected.arrayIndexKey(array, index);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (key == null) {
			add(array);
		} else {
			add(array, key);
		}
		setStatusMessage("Loading Force-Directed Graph");
		delimitEditor();
	}
	selected.remove = function() {
		processArrayIndexKey = selected.arrayIndexKey(array, index);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (selected.action == "element") {
			remove(selected.array, key);
		}
		if (selected.action == "add") {
			add(selected.array, key, true);
			selector();
		}
		if (selected.action == "remove") {
			remove(selected.array, key, true);
		}
		window.selection.uncolor();
		setStatusMessage("Loading Force-Directed Graph");
		delimitEditor();
	}
	if (canProceed == true) {
		if (selected.action != null) {
			document.getElementById("selected").innerHTML = selected.array + "_" + selected.index + "_" + selected.action;
		} else if (document.getElementById("selected") != null) {
			document.getElementById("selected").innerHTML = "";
		}
	}
	if (canProceed == true || typeof window.selection == "undefined") {
		window.selection = selected;
		if (suppressGraphicalUI == false) {
			tabsManager.setCurrentTab(4);
		}
	}
}