tabsHandler = function() {
	tabsManager = {};
	tabsManager.revert = function() {
		document.getElementById("searchSuggestionsScroller").scrollTop = 0;
		document.getElementById("jsonViewerScroller").scrollTop = 0;
		document.getElementById("graphicalUIScroller").scrollTop = 0;
		document.getElementById("consoleInterface").style.display = "none";
		document.getElementById("searchEngine").style.display = "none";
		document.getElementById("jsonViewer").style.display = "none";
		document.getElementById("graphicalUI").style.display = "none";
		document.getElementById("openConsoleInterface").innerHTML = "Console";
		document.getElementById("openSearchEngine").innerHTML = "Search";
		document.getElementById("openJsonViewer").innerHTML = "JSON";
		document.getElementById("openGraphicalUI").innerHTML = "GUI";
		document.getElementById("query").blur();
		document.getElementById("searchBar").blur();
	}
	tabsManager.setCurrentTab = function(tab) {
		tabsManager.currentTab = tab;
		tabsManager.revert();
		if (tab == 1) {
			document.getElementById("openConsoleInterface").innerHTML = "[Console]";
			document.getElementById("consoleInterface").style.display = "initial";
			document.getElementById("query").focus();
			for (i = 0; i < traceCache.length; i++) {
				document.getElementById("output").innerHTML += traceCache[i] + new_line();
				document.getElementById("scroller").scrollTop = document.getElementById("scroller").scrollHeight;
			}
			window.traceCache = [];
		} else if (tab == 2) {
			document.getElementById("openSearchEngine").innerHTML = "[Search]";
			document.getElementById("searchEngine").style.display = "initial";
			document.getElementById("searchBar").focus();
		} else if (tab == 3) {
			document.getElementById("openJsonViewer").innerHTML = "[JSON]";
			document.getElementById("jsonViewer").style.display = "initial";
		} else if (tab == 4) {
			document.getElementById("openGraphicalUI").innerHTML = "[GUI]";
			document.getElementById("graphicalUI").style.display = "initial";
		}
	}
	tabsManager.setCurrentTab(1);
	document.getElementById("openConsoleInterface").addEventListener('click', function(event) {
		tabsManager.setCurrentTab(1);
	});
	document.getElementById("openSearchEngine").addEventListener('click', function(event) {
		tabsManager.setCurrentTab(2);
	});
	document.getElementById("openJsonViewer").addEventListener('click', function(event) {
		tabsManager.setCurrentTab(3);
	});
	document.getElementById("openGraphicalUI").addEventListener('click', function(event) {
		tabsManager.setCurrentTab(4);
	});
	tabsManager.navigateTabs = function() {
		if (hotkeys.alt.keyStatus == 1) {
			if (hotkeys.one.keyStatus == 1) {
				hotkeys.one.keyStatus = 2;
				tabsManager.setCurrentTab(1);
			}
			if (hotkeys.two.keyStatus == 1) {
				hotkeys.two.keyStatus = 2;
				tabsManager.setCurrentTab(2);
			}
			if (hotkeys.three.keyStatus == 1) {
				hotkeys.three.keyStatus = 2;
				tabsManager.setCurrentTab(3);
			}
			if (hotkeys.four.keyStatus == 1) {
				hotkeys.four.keyStatus = 2;
				tabsManager.setCurrentTab(4);
			}
		}
	}
	return tabsManager;
}

fileHandler = function() {
	fileManager = {};
	fileManager.import = function(filename, passcode = null) {
		if (passcode == null) {
			query = `export("` + filename.split(`"`).join(`\"`) + `");`;
		} else {
			query = `export("` + filename.split(`"`).join(`\"`) + `, ` + passcode.split(`"`).join(`\"`) + `");`;
		}
		queryBarManager.query(query, `system`, `
			anchor = document.createElement("a");
			anchor.href = "database/" + JSON.parse(this.responseText)._filename;
			anchor.download = JSON.parse(this.responseText)._filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
		`, 0);
	}
	fileManager.export = function() {
		uploaderObject = {};
		uploaderObject.uploaderForm = document.getElementById("gui").appendChild(document.createElement("form"));
		uploaderObject.uploaderForm.action = "http://localhost:800/terminal";
		uploaderObject.uploaderForm.method = "post";
		uploaderObject.uploaderForm.target = "uploader";
		uploaderObject.uploaderForm.enctype = "multipart/form-data";
		uploaderObject.uploaderForm.style.display = "none";
		uploaderObject.uploaded = uploaderObject.uploaderForm.appendChild(document.createElement("input"));
		uploaderObject.uploaded.name = "uploaded";
		uploaderObject.uploaded.type = "file";
		uploaderObject.uploaded.addEventListener("change", function() {
			uploaderObject.uploaded.form.submit();
		});
		uploaderObject.upload = function() {
			uploaderObject.uploaded.click();
		}
		uploaderObject.uploader = uploaderObject.uploaderForm.appendChild(document.createElement("iframe"));
		uploaderObject.uploader.id = "uploader";
		uploaderObject.uploader.name = "uploader";
		document.getElementById("uploader").onload = function() {
			output = document.getElementById("uploader").contentDocument.body.innerHTML || null;
			if (output) {
				output = JSON.parse(output);
				output = JSON.stringify(output, null, 4);
				trace(output);
			}
		}
		return uploaderObject;
	}
	return fileManager;
}

queryBarHandler = function() {
	queryBarObject = {};
	queryBarObject.previous = [""];
	queryBarObject.pointer = queryBarObject.previous.length - 1;
	queryBarObject.navigateHistory = function() {
		if (document.activeElement.id == "query") {
			if (hotkeys.down.keyStatus == 1) {
				if (queryBarObject.pointer < queryBarObject.previous.length - 1) {
					hotkeys.down.keyStatus = 2;
					queryBarObject.pointer += 1;
					document.getElementById("query").value = queryBarObject.previous[queryBarObject.pointer];
					if (queryBarObject.pointer == queryBarObject.previous.length - 1) {
						document.getElementById("query").value = queryBarObject.previous[queryBarObject.previous.length - 1];
					}
				}
			}
			if (hotkeys.up.keyStatus == 1) {
				if (queryBarObject.pointer > 0) {
					hotkeys.up.keyStatus = 2;
					if (queryBarObject.pointer == queryBarObject.previous.length - 1) {
						queryBarObject.previous[queryBarObject.previous.length - 1] = document.getElementById("query").value;
					}
					queryBarObject.pointer -= 1;
					document.getElementById("query").value = queryBarObject.previous[queryBarObject.pointer];
				}
			}
		}
	}
	queryBarObject.query = function(query, author = "user", promise = "", visibleLevel = 2) {
		if (query.lastIndexOf(";") == query.length - 1) {
			processQuery = query;
		} else {
			processQuery = query + ";";
		}
		document.getElementById("query").value = "";
		if (visibleLevel > 1) {
			if (author == "user") {
				trace("se > " + query);
			} else {
				trace(query);
			}
		}
		if (processQuery.indexOf("js.") == 0) {
			jsQuery = processQuery.substring(3, processQuery.length);
			eval(jsQuery);
		} else {
			terminalFunction(function(responseText) {
				this.responseText = responseText;
				json = JSON.parse(this.responseText);
				json = JSON.stringify(json, null, 4);
				if (visibleLevel > 0) {
					trace(json);
				}
				eval(promise);
			}, processQuery);
		}
		if (author == "user") {
			queryBarObject.previous[queryBarObject.previous.length - 1] = query;
			queryBarObject.previous[queryBarObject.previous.length] = "";
			queryBarObject.pointer = queryBarObject.previous.length - 1;
		}
	}
	queryBarObject.insert = function(entry) {
		originalPosition = document.getElementById("query").selectionStart;
		replacedPosition = document.getElementById("query").selectionEnd;
		newPosition = originalPosition + entry.length;
		document.getElementById("query").value = document.getElementById("query").value.substring(0, originalPosition) + entry + document.getElementById("query").value.substring(replacedPosition, document.getElementById("query").value.length);
		document.getElementById("query").selectionStart = newPosition;
		document.getElementById("query").selectionEnd = newPosition;
		document.getElementById("query").focus();
		hotkeys.enter.keyStatus = 2;
		tabsManager.setCurrentTab(1);
	}
	return queryBarObject;
}

searchBarHandler = function() {
	searchBarObject = {};
	searchBarObject.searchOrigin = "";
	searchBarObject.searchArray = [];
	searchBarObject.processArray = [];
	searchBarObject.lastSearched = "";
	searchBarObject.handler = function() {
		if (document.activeElement.id == "searchBar") {
			if (document.getElementById("searchBar").value == "") {
				searchBarObject.lastSearched = "";
				return true;
			} else if (document.getElementById("searchBar").value != searchBarObject.lastSearched) {
				searchBarObject.lastSearched = document.getElementById("searchBar").value;
				processValue = document.getElementById("searchBar").value;
				if (processValue.substring(processValue.length - 1) != "%") {
					processValue += "%";
				}
				terminalFunction(function(responseText) {
					this.responseText = responseText;
					if (JSON.parse(this.responseText)._uuid != null) {
						searchBarManager.start(this.responseText);
					}
				}, "search('content', '" + processValue + "', 'property', true);");
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	searchBarObject.wrapper = function() {
		if (searchBarObject.handler() == false) {
			if (hotkeys.ctrl.keyStatus != 0 && hotkeys.alt.keyStatus != 0) {
				if (document.activeElement.id) {
					if (document.activeElement.id != "searchBar") {
						searchBarObject.searchOrigin = document.activeElement.id;
					}
				} else {
					searchBarObject.searchOrigin = "";
				}
				document.getElementById("searchBar").value = "";
				document.getElementById("searchBar").focus();
				tabsManager.setCurrentTab(2);
			}
		}
	}
	searchBarObject.start = function(searchResults) {
		searchBarObject.processArray = JSON.parse(searchResults)._uuid;
		searchBarObject.searchArray = [];
		for (i = 0; i < searchBarObject.processArray.length; i++) {
			if (searchBarObject.processArray[i].length == 2) {
				searchBarObject.searchArray[searchBarObject.searchArray.length] = [searchBarObject.processArray[i][0], [searchBarObject.processArray[i][1]]];
			}
			if (searchBarObject.processArray[i].length == 1) {
				searchBarObject.searchArray[searchBarObject.searchArray.length - 1][1][searchBarObject.searchArray[searchBarObject.searchArray.length - 1][1].length] = searchBarObject.processArray[i][0];
			}
		}
		document.getElementById("searchSuggestions").innerHTML = "";
		for (i = 0; i < searchBarObject.searchArray.length; i++) {
			document.getElementById("searchSuggestions").innerHTML += searchBarObject.searchArray[i][0] + ": ";
			for (j = 0; j < searchBarObject.searchArray[i][1].length; j++) {
				if (j != 0) {
					document.getElementById("searchSuggestions").innerHTML += ", ";
				}
				document.getElementById("searchSuggestions").innerHTML += searchBarObject.searchArray[i][1][j];
			}
			document.getElementById("searchSuggestions").innerHTML += "<br>";
		}
	}
	searchBarObject.end = function() {
		if (searchBarObject.searchArray[0][0]) {
			entry = searchBarObject.searchArray[0][0];
			if (hotkeys.shift.keyStatus > 0) {
				load(entry);
				document.getElementById("searchBar").focus();
			} else if (searchBarObject.searchOrigin == "query") {
				queryBarManager.insert(entry);
			} else if (searchBarObject.searchOrigin.length > 0) {
				arrayIndex = new ArrayIndex(searchBarObject.searchOrigin);
				hotkeys.enter.keyStatus = 2;
				reduxStore.dispatch({
					"type": "EDITOR_UPDATE_AFTER_SEARCH", 
					"array": arrayIndex.array, 
					"attribute": arrayIndex.attribute, 
					"updated": entry, 
					"index": arrayIndex.index
				});
			}
		}
		document.getElementById("searchBar").value = "";
		searchBarObject.searchOrigin = "";
	}
	return searchBarObject;
}