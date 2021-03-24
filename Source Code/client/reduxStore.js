initialState = {
	"canProceed": true, 
	"suppressGraphicalUI": false, 
	"editorStoreDispatch": null, 
	"uncolorTarget": null, 
	"selected": {
		"array": null, 
		"index": null, 
		"action": null
	}
};

selectionAdd = function (array = null, index = null) {
	reduxStore.dispatch({
		"type": "SELECTOR_ADD", 
		"cache": reduxStore.getState().editor, 
		"target": {
			"array": array, 
			"index": index
		}
	});
}

selectionRemove = function () {
	var selection = reduxStore.getState().selector.selected;
	reduxStore.dispatch({
		"type": "SELECTOR_REMOVE", 
		"cache": reduxStore.getState().editor, 
		"target": {
			"array": selection.array, 
			"index": selection.index, 
			"action": selection.action
		}
	});
}

selectorReducer = function (state = JSON.parse(JSON.stringify(initialState)), action = {}) {
	state.editorStoreDispatch = null;
	
	var pureUnselect = false;
	var resetSelection = function () {
		let editorStoreDispatch = state.editorStoreDispatch;
		state = JSON.parse(JSON.stringify(initialState));
		state.editorStoreDispatch = editorStoreDispatch;
		document.getElementById("selected").innerHTML = "";
	}
	
	var uncolor = function (id) {
		if (document.getElementById(id) != null) {
			document.getElementById(id).setShadowStyle("color", "#000000");
		}
	}
	
	var arrayIndexKey = function (target = {}) {
		if (target.array === null) {
			target.array = state.selected.array;
		}
		
		if (target.index === null) {
			target.index = state.selected.index;
		}
		
		try {
			var editor = action.cache;
			if (target.array === "group_uuid") {
				key = editor[target.array][target.index]["_parent"];
			} else if (target.array === "group_parent") {
				key = editor[target.array][target.index]["_uuid"];
			} else {
				key = editor[target.array][target.index]["_uuid"];
			}
		} catch (error) {
			key = null;
		}
		
		return {
			"array": target.array, 
			"index": target.index, 
			"key": key
		};
	}
	
	if (action.type === "SELECTOR_RESET") {
		resetSelection();
		state.suppressGraphicalUI = true;
	} else if (action.type === "SELECTOR_SELECT") {
		let newTarget = action.selection.array + "_" + action.selection.index + action.selection.attribute;
		let currentTarget = state.selected.array + "_" + state.selected.index + state.selected.attribute;
		if (state.uncolorTarget === currentTarget) {
			/*
			Test whether or not this action is merely unselecting the current selection, instead of selecting something new
			This is important because if this action is merely unselecting, we only need to uncolor, but, 
			if we are selecting something new, we need to perform the actions to select the new element as well
			*/
			if (state.uncolorTarget === newTarget) {
				pureUnselect = true;
				document.getElementById("selected").innerHTML = "";
				state.suppressGraphicalUI = true;
			} else {
				pureUnselect = false;
			}
			
			uncolor(state.uncolorTarget);
			state.uncolorTarget = null;
			state = JSON.parse(JSON.stringify(initialState));
		}
		
		if (isSameObject(state.selected, action.selection) !== true && pureUnselect === false) {
			var editor = action.cache;
			state.selected = {
				"array": action.selection.array, 
				"index": action.selection.index, 
				"action": action.selection.action, 
				"attribute": action.selection.attribute
			};
			
			state.uncolorTarget = state.selected.array + "_" + state.selected.index + state.selected.attribute;
			document.getElementById(state.uncolorTarget).setShadowStyle("color", "#FF0000");
			var string = state.selected.attribute;
			if (state.selected.action !== null) {
				document.getElementById("selected").innerHTML = state.selected.array + "_" + state.selected.index + "_" + state.selected.action;
			}
		}
	} else if (action.type === "SELECTOR_ADD") {
		processArrayIndexKey = arrayIndexKey(action.target);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (key == null) {
			state.editorStoreDispatch = {
				"type": "EDITOR_ADD", 
				"array": array
			};
		} else {
			state.editorStoreDispatch = {
				"type": "EDITOR_ADD", 
				"array": array, 
				"key": key
			};
		}
	} else if (action.type === "SELECTOR_REMOVE") {
		processArrayIndexKey = arrayIndexKey(action.target);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (state.selected.action == "element") {
			state.editorStoreDispatch = {
				"type": "EDITOR_REMOVE", 
				"array": state.selected.array, 
				"key": key
			};
		} else if (state.selected.action == "add") {
			state.editorStoreDispatch = {
				"type": "EDITOR_ADD", 
				"array": state.selected.array, 
				"key": key, 
				"opposite": true
			};
		} else if (state.selected.action == "remove") {
			state.editorStoreDispatch = {
				"type": "EDITOR_REMOVE", 
				"array": state.selected.array, 
				"key": key, 
				"opposite": true
			};
		}
		uncolor(state.uncolorTarget);
		resetSelection();
	}
	if (action.type.startsWith("SELECTOR") && state.suppressGraphicalUI === false && pureUnselect === false) {
		if (typeof tabsManager !== "undefined") {
			tabsManager.setCurrentTab(4);
		}
	}
	return state;
}

editorReducer = function (state = {}, action = {}) {
	var stateIterate = function (iterateFunction, state, condition, loop = null) {
		iterateLoop = ["group_uuid", "object_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		for (iterateCounter = 0; iterateCounter < iterateLoop.length; iterateCounter++) {
			array = iterateLoop[iterateCounter];
			if (state[array]) {
				if (loop == false) {
					if (eval(condition)) iterateFunction(array);
				} else {
					for (i = 0; i < state[array].length; i++) {
						if (loop == null) {
							if (eval(condition)) iterateFunction(array, i);
						} else {
							for (j = 0; j < loop.length; j++) {
								variable = loop[j];
								if (eval(condition)) iterateFunction(array, i, variable);
							}
						}
					}
				}
			}
		}
	}
	
	if (action.type === "EDITOR_EMPTY") {
		state = {};
	} else if (action.type === "EDITOR_RESET") {
		state = action.editor;
		var duplicateItemAttribute = function(item, originalAttribute, targetAttribute) {
			var output = {};
			for (preexistingAttribute in item) {
				output[preexistingAttribute] = item[preexistingAttribute];
				if (preexistingAttribute === originalAttribute) {
					output[targetAttribute] = item[originalAttribute];
				}
			}
			return output;
		}
		stateIterate(function(array, i) {
			state[array][i] = duplicateItemAttribute(state[array][i], "_uuid", "_old");
			if (array.split("_")[0] == "group") {
				state[array][i] = duplicateItemAttribute(state[array][i], "_parent", "_parentOld");
			}
		}, state, true);
	} else if (action.type === "EDITOR_ADD") {
		const array = action.array;
		const uuid = action.key === undefined ? null : action.key;
		const opposite = action.opposite === undefined ? false : action.opposite;
		if (opposite == true) {
			if (uuid == null) {
				uuid = state[array][0]._uuid;
			}
			for (i = 0; i < state[array].length; i++) {
				if (state[array][i]._uuid == uuid) {
					if (state[array][i]._add == true) {
						state[array].splice(0 - (state[array].length - i), 1);
					}
				}
			}
		} else {
			if (!(state[array])) {
				state[array] = [];
			}
			if (uuid == null) {
				index = 0;
			} else {
				for (i = 0; i < state[array].length; i++) {
					if (state[array][i]._uuid == uuid) {
						index = i + 1;
					}
				}
			}
			if (array.startsWith("object")) {
				state[array].splice(index, 0, {
					"_uuid": "", 
					"_type": "object", 
					"_add": true
				});
			} else if (array.startsWith("group")) {
				state[array].splice(index, 0, {
					"_uuid": "", 
					"_parent": "", 
					"_type": "group", 
					"_add": true
				});
			} else if (array.startsWith("link")) {
				state[array].splice(index, 0, {
					"_uuid": "", 
					"_start": "", 
					"_end": "", 
					"_direction": null, 
					"_type": "link", 
					"_add": true
				});
			} else if (array.startsWith("property")) {
				state[array].splice(index, 0, {
					"_uuid": "", 
					"_parent": "", 
					"_name": "", 
					"_content": "", 
					"_type": "property", 
					"_add": true
				});
			}
			state[array][index]["_" + array.split("_")[1]] = currentlyOpened;
		}
	} else if (action.type === "EDITOR_REMOVE") {
		const array = action.array;
		const uuid = action.key === undefined ? null : action.key;
		const opposite = action.opposite === undefined ? false : action.opposite;
		if (array == "group_uuid") {
			buffer = "_parent";
		} else if (array == "group_parent") {
			buffer = "_uuid";
		} else {
			buffer = "_uuid";
		}
		if (uuid == null) {
			uuid = state[array][state[array].length - 1][buffer];
		}
		for (i = 0; i < state[array].length; i++) {
			if (state[array][i][buffer] == uuid) {
				if (opposite == true) {
					delete state[array][i]._remove;
				} else {
					state[array][i]._remove = true;
				}
			}
		}
	} else if (action.type === "EDITOR_UPDATE") {
		const array = action.array;
		const attribute = action.attribute;
		const updatedValue = action.updated;
		const index = action.index;
		
		// If a key is edited, all instances of that key within the editorReducer's state should also be updated accordingly
		const originalValue = state[array][index][attribute];
		stateIterate(function(array, i, variable) {
			if (state[array][i][variable]) {
				if (state[array][i][variable] === originalValue) {
					state[array][i][variable] = updatedValue;
				}
			}
		}, state, "state[array][i]", ["_uuid", "_parent", "_start", "_end"]);
		
		state[array][index][attribute] = updatedValue;
	}
	return state;
}

reduxStore = Redux.createStore(Redux.combineReducers({
	"selector": selectorReducer, 
	"editor": editorReducer
}), /* Redux DevTools for debugging purposes */ window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

reduxStore.subscribe(function () {
	const editorStoreDispatch = reduxStore.getState().selector.editorStoreDispatch;
	if (editorStoreDispatch !== null) reduxStore.dispatch(editorStoreDispatch);
	
	if (JSON.stringify(reduxStore.getState().editor) === "{}") {
		document.getElementById("sidebar").innerHTML = "No Content";
		document.getElementById("sidebarPreview").innerHTML = "No Content";
		reduxStore.dispatch({
			"type": "SELECTOR_RESET"
		});
	} else {
		generateEditor();
		
		(function () {
			const uncolorTarget = reduxStore.getState().selector.uncolorTarget;
			if (uncolorTarget !== null) {
				document.getElementById(uncolorTarget).setShadowStyle("color", "#FF0000");
			}
		})();
		
		(function () {
			var editor = reduxStore.getState().editor;
			if (JSON.stringify(editor) !== "{}") {
				document.getElementById("sidebarPreview").innerHTML = JSON.stringify(editor, null, 4);
			}
		})();
	}
});