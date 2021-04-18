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
	editor = reduxStore.getState().editor;
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
		return "<->";
	} else if (input == true) {
		return "->";
	} else if (input == false) {
		return "<-";
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

isSameObject = function(input1, input2) {
	if (JSON.stringify(input1) === JSON.stringify(input2)) {
		return true;
	} else {
		return false;
	}
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
	var script = [];
	var editor = reduxStore.getState().editor;
	var delimit = function(attribute) {
		return editor[array][i][attribute].split("\"").join("\\\"");
	}
	iterate(function(array, i) {
		script[script.length] = '(new _' + delimit("_type") + '())->add(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + delimit("_uuid") + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + delimit("_uuid") + '", "' + delimit("_parent") + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + delimit("_uuid") + '", "' + delimit("_start") + '", "' + delimit("_end") + '", ' + boolean_convert(editor[array][i]._direction);
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + delimit("_uuid") + '", "' + delimit("_parent") + '", "' + delimit("_name") + '", "' + delimit("_content") + '"';
		}
		script[script.length - 1] += ');';
	}, "editor[array][i]._add == true");
	iterate(function(array, i) {
		script[script.length] = '(new _' + delimit("_type") + '())->remove(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + delimit("_uuid") + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + delimit("_uuid") + '", "' + delimit("_parent") + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + delimit("_uuid") + '"';
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + delimit("_uuid") + '"';
		}
		script[script.length - 1] += ');';
	}, "editor[array][i]._remove == true");
	iterate(function(array, i) {
		script[script.length] = '(new _' + delimit("_type") + '())->save(';
		if (editor[array][i]._type == "object") {
			script[script.length - 1] += '"' + delimit("_old") + '", "' + delimit("_uuid") + '"';
		}
		if (editor[array][i]._type == "group") {
			script[script.length - 1] += '"' + delimit("_old") + '", "' + delimit("_uuid") + '", "' + delimit("_parent") + '", "' + delimit("_parentOld") + '"';
		}
		if (editor[array][i]._type == "link") {
			script[script.length - 1] += '"' + delimit("_old") + '", "' + delimit("_uuid") + '", "' + delimit("_start") + '", "' + delimit("_end") + '", ' + boolean_convert(editor[array][i]._direction);
		}
		if (editor[array][i]._type == "property") {
			script[script.length - 1] += '"' + delimit("_old") + '", "' + delimit("_uuid") + '", "' + delimit("_parent") + '", "' + delimit("_name") + '", "' + delimit("_content") + '"';
		}
		script[script.length - 1] += ');';
	}, "!(editor[array][i]._add == true || editor[array][i]._remove == true)");
	script[script.length] = "(new _terminal())->undefine();";
	return script.join("\n");
}

load = function(query) {
	currentlyOpened = query;
	queryBarManager.query(`open("` + query + `");`, `system`, `
		try {
			var editor = JSON.parse(this.responseText);
		} catch (error) {
			var editor = null;
		} finally {
			if (editor !== null) {
				render(editor);
			} else {
				currentlyOpened = null;
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
		queryBarManager.query(encodeURIComponent("script(\"" + encodeURIComponent(generateScript()) + "\");"), "system", "reload();", 1);
	}
}

reload = function () {
	var editor = reduxStore.getState().editor;
	if (typeof editor === "object" && JSON.stringify(editor) !== "{}") {
		var notRemovedElementFound = false;
		for (var array in editor) {
			if (array !== "object_uuid") {
				for (var item in editor[array]) {
					if (!(editor[array][item]._remove === true)) {
						notRemovedElementFound = true;
					}
				}
			}
		}
		
		if (notRemovedElementFound === true) {
			load(reduxStore.getState().editor["object_uuid"][0]._uuid);
		} else {
			reduxStore.dispatch({
				"type": "EDITOR_EMPTY"
			});
		}
	} else {
		reduxStore.dispatch({
			"type": "EDITOR_EMPTY"
		});
	}
}

class ArrayAttribute {
	constructor (array) {
		this.array = array;
		if (this.array === "group_uuid") {
			this.attribute = "_parent";
		} else if (this.array === "group_parent") {
			this.attribute = "_uuid";
		} else {
			this.attribute = "_uuid";
		}
	}
}

class ArrayIndex {
	constructor (id) {
		this.array = id.split("_")[0] + "_" + id.split("_")[1];
		this.index = id.split("_")[2];
		this.attribute = "_" + id.split("_")[3];
	}
}