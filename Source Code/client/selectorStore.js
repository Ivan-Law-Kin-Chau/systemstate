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
	selectorStore.dispatch({
		"type": "add", 
		"target": {
			"array": array, 
			"index": index
		}
	});
}

selectionRemove = function () {
	selection = selectorStore.getState().selected;
	selectorStore.dispatch({
		"type": "remove", 
		"target": {
			"array": selection.array, 
			"index": selection.index, 
			"action": selection.action
		}
	});
}

selectorStore = Redux.createStore(function(state = JSON.parse(JSON.stringify(initialState)), action = {}) {
	console.log("selectorStore", action);
	state.editorStoreDispatch = null;
	
	var pureUnselect = false;
	var resetSelection = function() {
		let editorStoreDispatch = state.editorStoreDispatch;
		state = JSON.parse(JSON.stringify(initialState));
		state.editorStoreDispatch = editorStoreDispatch;
		document.getElementById("selected").innerHTML = "";
	}
	
	var uncolor = function(id) {
		if (document.getElementById(id) != null) {
			document.getElementById(id).setShadowStyle("color", "#000000");
		}
	}
	
	var arrayIndexKey = function(target = {}) {
		if (target.array === null) {
			target.array = state.selected.array;
		}
		
		if (target.index === null) {
			target.index = state.selected.index;
		}
		
		try {
			var editor = editorStore.getState().editor;
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
	
	if (action.type === "reset") {
		resetSelection();
		state.suppressGraphicalUI = true;
	} else if (action.type === "select") {
		/*
		Whether or not this action is merely unselecting the current selection, instead of selecting something new
		This is important because if this action is merely unselecting, we only need to uncolor, but, 
		if we are selecting something new, we need to perform the actions to select the new element as well
		*/
		let newTarget = action.selection.array + "_" + action.selection.index + action.selection.attribute;
		let currentTarget = state.selected.array + "_" + state.selected.index + state.selected.attribute;
		if (state.uncolorTarget === currentTarget) {
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
			var editor = editorStore.getState().editor;
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
	} else if (action.type === "add") {
		processArrayIndexKey = arrayIndexKey(action.target);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (key == null) {
			state.editorStoreDispatch = {
				"type": "add", 
				"array": array
			};
		} else {
			state.editorStoreDispatch = {
				"type": "add", 
				"array": array, 
				"key": key
			};
		}
	} else if (action.type === "remove") {
		processArrayIndexKey = arrayIndexKey(action.target);
		array = processArrayIndexKey.array;
		index = processArrayIndexKey.index;
		key = processArrayIndexKey.key;
		if (state.selected.action == "element") {
			state.editorStoreDispatch = {
				"type": "remove", 
				"array": state.selected.array, 
				"key": key
			};
		} else if (state.selected.action == "add") {
			state.editorStoreDispatch = {
				"type": "add", 
				"array": state.selected.array, 
				"key": key, 
				"opposite": true
			};
		} else if (state.selected.action == "remove") {
			state.editorStoreDispatch = {
				"type": "remove", 
				"array": state.selected.array, 
				"key": key, 
				"opposite": true
			};
		}
		uncolor(state.uncolorTarget);
		resetSelection();
	}
	if (state.suppressGraphicalUI === false && pureUnselect === false) {
		if (typeof tabsManager !== "undefined") {
			tabsManager.setCurrentTab(4);
		}
	}
	return state;
});

selectorStore.subscribe(function () {
	const editorStoreDispatch = selectorStore.getState().editorStoreDispatch;
	if (editorStoreDispatch !== null) editorStore.dispatch(editorStoreDispatch);
});