new_line = function() {
	return "\n";
}

trace = function(output = "") {
	if (tabsManager.currentTab == 1) {
		document.getElementById("output").innerHTML += output + new_line();
		document.getElementById("scroller").scrollTop = document.getElementById("scroller").scrollHeight;
	} else {
		traceCache[traceCache.length] = output;
	}
}

iterate = function(iterateFunction, condition, loop = null) {
	iterateLoop = ["group_uuid", "object_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
	for (iterateCounter = 0; iterateCounter < iterateLoop.length; iterateCounter++) {
		array = iterateLoop[iterateCounter];
		if (editor[array]) {
			if (loop == false) {
				if (condition_convert(condition)) {
					iterateFunction(array);
				}
			} else {
				for (i = 0; i < editor[array].length; i++) {
					if (loop == null) {
						if (condition_convert(condition)) {
							iterateFunction(array, i);
						}
					} else {
						for (j = 0; j < loop.length; j++) {
							variable = loop[j];
							if (condition_convert(condition)) {
								iterateFunction(array, i, variable);
							}
						}
					}
				}
			}
		}
	}
}

condition_convert = function(input = null) {
	if (input === null) {
		return true;
	} else {
		eval("if(" + input + ") { output = true; } else { output = false; }");
		return output;
	}
}

direction_convert = function(input) {
	if (input == null) {
		return "&lt;-&gt;";
	} else if (input == true) {
		return "-&gt";
	} else if (input == false) {
		return "&lt;-";
	}
}

boolean_convert = function(input) {
	if (input === null || input == null) {
		return "null";
	} else if (input === true || input == "1") {
		return "true";
	} else if (input === false || input == "0") {
		return "false";
	}
}

detectSpecialCharacters = function(input) {
	specialCharacterDetected = false;
	range = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (i = 0; i < input.length; i++) {
		if (range.indexOf(input[i]) == -1) {
			specialCharacterDetected = true;
		}
	}
	return specialCharacterDetected;
}

delimit = function(input, opposite = false) {
	try {
		input.split("");
		splitErrorExists = false;
	} catch (splitError) {
		splitErrorExists = true;
	} finally {
		if (!(splitErrorExists)) {
			if (opposite == true) {
				return input.split("'").join("'").split('\\"').join('"');
			} else {
				return input.split("'").join("'").split('"').join('\\"');
			}
		} else {
			return input;
		}
	}
}

delimitAll = function(opposite = false) {
	iterate(function(array, i) {
		for (value in editor[array][i]) {
			if (value != "_sql") {
				editor[array][i][value] = delimit(editor[array][i][value], opposite);
			}
		}
	}, true);
}

delimitEditor = function() {
	delimitAll(true);
	eval(delimit(unsavedScript, true));
	render(editor, false);
	delimitAll(false);
}

insertJson = function(array, attribute, target) {
	output = {};
	for (preexistingAttribute in array) {
		output[preexistingAttribute] = array[preexistingAttribute];
		if (preexistingAttribute == target) {
			output[attribute] = array[target];
		}
	}
	return output;
}

updateJson = function(array, attribute, updated, index, replaceValueNeeded = true) {
	updated = delimit(updated);
	if (attribute == "_direction") {
		if (editor[array][index]._direction == null) {
			updated = true;
			eval(array + "_" + index + attribute + ".innerHTML = \"-&gt;\"");
		} else if (editor[array][index]._direction == true) {
			updated = false;
			eval(array + "_" + index + attribute + ".innerHTML = \"&lt;-\"");
		} else if (editor[array][index]._direction == false) {
			updated = null;
			eval(array + "_" + index + attribute + ".innerHTML = \"&lt;-&gt;\"");
		}
	}
	if (replaceValueNeeded == true) {
		depended = editor[array][index][attribute];
		iterate(function(array, i, variable) {
			if (editor[array][i][variable]) {
				if (editor[array][i][variable] == depended) {
					editor[array][i][variable] = updated;
				}
			}
		}, "editor[array][i]", ["_uuid", "_parent", "_start", "_end"]);
	}
	render();
	if (attribute == "_direction") {
		output = 'editor.' + array + '[' + index + '].' + attribute + ' = ' + boolean_convert(updated) + ';';
	} else {
		output = 'editor.' + array + '[' + index + '].' + attribute + ' = `' + updated + '`;';
	}
	if (unsavedScript != null) {
		if (unsavedScript == "") {
			unsavedScript = output;
		} else {
			unsavedScript += " " + output;
		}
	}
	return output;
}

listIncomplete = function(loop, lengthHasToBeEight = false) {
	incomplete = [];
	iterate(function(array, i, variable) {
		if (editor[array][i][variable].length != 8 && lengthHasToBeEight == true) {
			incomplete[incomplete.length] = [array, i, variable];
		}
		if (editor[array][i][variable].length == 0 && lengthHasToBeEight == false) {
			incomplete[incomplete.length] = [array, i, variable];
		}
	}, 'editor[array][i][variable] || editor[array][i][variable] == ""', loop);
	return incomplete;
}

generateScript = function() {
	script = [];
	iterate(function(array, i) {
		script[script.length] = '(new _' + editor[array][i]._type + '())->add(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '", "' + editor[array][i]._parent + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '", "' + editor[array][i]._start + '", "' + editor[array][i]._end + '", ' + boolean_convert(editor[array][i]._direction);
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '", "' + editor[array][i]._parent + '", "' + editor[array][i]._name + '", "' + editor[array][i]._content + '"';
		}
		script[script.length - 1] += ');';
	}, "editor[array][i]._add == true");
	iterate(function(array, i) {
		script[script.length] = '(new _' + editor[array][i]._type + '())->remove(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '", "' + editor[array][i]._parent + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '"';
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + editor[array][i]._uuid + '"';
		}
		script[script.length - 1] += ');';
	}, "editor[array][i]._remove == true");
	iterate(function(array, i) {
		script[script.length] = '(new _' + editor[array][i]._type + '())->save(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + editor[array][i]._old + '", "' + editor[array][i]._uuid + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + editor[array][i]._old + '", "' + editor[array][i]._uuid + '", "' + editor[array][i]._parent + '", "' + editor[array][i]._parentOld + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + editor[array][i]._old + '", "' + editor[array][i]._uuid + '", "' + editor[array][i]._start + '", "' + editor[array][i]._end + '", ' + boolean_convert(editor[array][i]._direction);
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + editor[array][i]._old + '", "' + editor[array][i]._uuid + '", "' + editor[array][i]._parent + '", "' + editor[array][i]._name + '", "' + editor[array][i]._content + '"';
		}
		script[script.length - 1] += ');';
	}, "!(editor[array][i]._add == true || editor[array][i]._remove == true)");
	script[script.length] = "(new _terminal())->undefine();";
	return script.join("\n");
}

add = function(array, uuid = null, opposite = false) {
	if (opposite == true) {
		if (uuid == null) {
			uuid = editor[array][0]._uuid;
		}
		for (i = 0; i < editor[array].length; i++) {
			if (editor[array][i]._uuid == uuid) {
				if (editor[array][i]._add == true) {
					editor[array].splice(0 - (editor[array].length - i), 1);
				}
			}
		}
	} else {
		if (!(editor[array])) {
			editor[array] = [];
		}
		if (uuid == null) {
			index = 0;
		} else {
			for (i = 0; i < editor[array].length; i++) {
				if (editor[array][i]._uuid == uuid) {
					index = i + 1;
				}
			}
		}
		if (array.indexOf("object") == 0) {
			editor[array].splice(index, 0, {
				"_uuid": "", 
				"_type": "object", 
				"_add": true
			});
		}
		if (array.indexOf("group") == 0) {
			editor[array].splice(index, 0, {
				"_uuid": "", 
				"_parent": "", 
				"_type": "group", 
				"_add": true
			});
		}
		if (array.indexOf("link") == 0) {
			editor[array].splice(index, 0, {
				"_uuid": "", 
				"_start": "", 
				"_end": "", 
				"_direction": null, 
				"_type": "link", 
				"_add": true
			});
		}
		if (array.indexOf("property") == 0) {
			editor[array].splice(index, 0, {
				"_uuid": "", 
				"_parent": "", 
				"_name": "", 
				"_content": "", 
				"_type": "property", 
				"_add": true
			});
		}
		editor[array][index]["_" + array.split("_")[1]] = currentlyOpened;
	}
	render(editor);
}

load = function(query, useD3 = true) {
	searchBarManager.searchArray[-1] = [];
	searchBarManager.searchArray[-1][0] = query;
	queryBarManager.query(`open("` + query + `");`, `system`, `
		try {
			if ("` + query + `" == originallyOpened && mouseOnNode == true && ` + boolean_convert(useD3) + ` == false) {
				loadType = "redundant";
			} else if ("` + query + `" == originallyOpened && ` + boolean_convert(useD3) + ` == false) {
				loadType = "afterPreviewing";
				editor = JSON.parse(this.responseText);
			} else if ("` + query + `" != originallyOpened && ` + boolean_convert(useD3) + ` == false) {
				loadType = "previewing";
				editor = JSON.parse(this.responseText);
			} else {
				loadType = "normal";
				editor = JSON.parse(this.responseText);
			}
		} catch (error) {
			editor = null;
		} finally {
			if (editor != null && loadType != "redundant") {
				iterate(function(array, i) {
					editor[array][i] = insertJson(editor[array][i], "_old", "_uuid");
					if (array.split("_")[0] == "group") {
						editor[array][i] = insertJson(editor[array][i], "_parentOld", "_parent");
					}
				}, true);
				delimitAll(false);
				if (loadType == "afterPreviewing") {
					eval(delimit(unsavedScript, true));
				}
				if (loadType == "normal") {
					unsavedScript = "";
				}
				delimitAll(true);
				render(editor, ` + boolean_convert(useD3) + `);
				delimitAll();
				currentlyOpened = "` + query + `";
				if (` + boolean_convert(useD3) + ` == true) {
					originallyOpened = "` + query + `";
					mouseOnNode = false;
					setStatusMessage("Loading Force-Directed Graph");
				} else {
					if (mouseOnNode == true) {
						setStatusMessage("Previewing Editor");
					}
					if (mouseOnNode == false) {
						setStatusMessage();
					}
				}
				if (valid.indexOf("` + query + `") == -1) {
					valid[valid.length] = "` + query + `";
				}
			}
		}
	`, 0);
}

save = function(ignoreWarnings = false) {
	canProceed = true;
	incomplete = listIncomplete(["_uuid", "_parent", "_start", "_end"], true);
	if (incomplete.length > 0) {
		canProceed = false;
		errorMessage = "Error: Incomplete entries, save aborted" + new_line();
		for (i = 0; i < incomplete.length; i++) {
			errorMessage += incomplete[i][0] + "[" + incomplete[i][1] + "]: " + incomplete[i][2] + new_line();
		}
		trace(errorMessage);
	} else if (ignoreWarnings == false) {
		incomplete = listIncomplete(["_name", "_content"]);
		if (incomplete.length > 0) {
			canProceed = false;
			errorMessage = "Warning: Incomplete entries, save paused, input \"save(true);\" to carry on" + new_line();
			for (i = 0; i < incomplete.length; i++) {
				errorMessage += incomplete[i][0] + "[" + incomplete[i][1] + "]: " + incomplete[i][2] + new_line();
			}
			trace(errorMessage);
		}
	}
	if (canProceed == true) {
		queryBarManager.query(encodeURIComponent("script(\"" + encodeURIComponent(generateScript()) + "\");"), "system", "load(editor[\"object_uuid\"][0]._uuid);", 1);
		unsavedScript = null;
	}
}

remove = function(array, uuid = null, opposite = false) {
	if (array == "group_uuid") {
		buffer = "_parent";
	} else if (array == "group_parent") {
		buffer = "_uuid";
	} else {
		buffer = "_uuid";
	}
	if (uuid == null) {
		uuid = editor[array][editor[array].length - 1][buffer];
	}
	for (i = 0; i < editor[array].length; i++) {
		if (editor[array][i][buffer] == uuid) {
			if (opposite == true) {
				delete editor[array][i]._remove;
			} else {
				editor[array][i]._remove = true;
			}
		}
	}
	render(editor);
}