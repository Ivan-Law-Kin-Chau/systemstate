var initialState = {
	"canProceed": true, 
	"suppressGraphicalUI": false, 
	"editorStoreDispatch": null, 
	"colorTarget": null, 
	"selected": {
		"array": null, 
		"index": null, 
		"action": null
	}
};

var selectionAdd = function (array = null, index = null) {
	reduxStore.dispatch({
		"type": "SELECTOR_ADD", 
		"cache": reduxStore.getState().editor, 
		"target": {
			"array": array, 
			"index": index
		}
	});
}

var selectionRemove = function () {
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

var selectorReducer = function (state = JSON.parse(JSON.stringify(initialState)), action = {}) {
	var pureUnselect = false;
	var resetSelection = function () {
		let editorStoreDispatch = state.editorStoreDispatch;
		state = JSON.parse(JSON.stringify(initialState));
		state.editorStoreDispatch = editorStoreDispatch;
		document.getElementById("selected").innerHTML = "";
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
			var attribute = (new ArrayAttribute(target.array)).attribute;
			var key = editor[target.array][target.index][attribute];
		} catch (error) {
			var key = null;
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
		if (state.colorTarget === currentTarget) {
			/*
			Test whether or not this action is merely unselecting the current selection, instead of selecting something new
			This is important because if this action is merely unselecting, we only need to uncolor, but, 
			if we are selecting something new, we need to perform the actions to select the new element as well
			*/
			if (state.colorTarget === newTarget) {
				pureUnselect = true;
				document.getElementById("selected").innerHTML = "";
				state.suppressGraphicalUI = true;
			} else {
				pureUnselect = false;
			}
			
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
			
			state.colorTarget = state.selected.array + "_" + state.selected.index + state.selected.attribute;
			var string = state.selected.attribute;
			if (state.selected.action !== null) {
				document.getElementById("selected").innerHTML = state.selected.array + "_" + state.selected.index + "_" + state.selected.action;
			}
		}
	} else if (action.type === "SELECTOR_ADD") {
		const processArrayIndexKey = arrayIndexKey(action.target);
		const array = processArrayIndexKey.array;
		const index = processArrayIndexKey.index;
		const key = processArrayIndexKey.key;
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
		const processArrayIndexKey = arrayIndexKey(action.target);
		const array = processArrayIndexKey.array;
		const index = processArrayIndexKey.index;
		const key = processArrayIndexKey.key;
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
		state.colorTarget = null;
		resetSelection();
	}
	if (action.type.startsWith("SELECTOR") && state.suppressGraphicalUI === false && pureUnselect === false) {
		if (typeof tabsManager !== "undefined") {
			tabsManager.setCurrentTab(4);
		}
	}
	return state;
}

var editorReducer = function (state = {}, action = {}) {
	if (action.type === "EDITOR_EMPTY") {
		state = {};
	} else if (action.type === "EDITOR_RESET") {
		state = action.editor;
		var duplicateItemAttribute = function(item, originalAttribute, targetAttribute) {
			var output = {};
			for (let preexistingAttribute in item) {
				output[preexistingAttribute] = item[preexistingAttribute];
				if (preexistingAttribute === originalAttribute) {
					output[targetAttribute] = item[originalAttribute];
				}
			}
			return output;
		}
		for (let array in state) {
			for (let i = 0; i < state[array].length; i++) {
				state[array][i] = duplicateItemAttribute(state[array][i], "_uuid", "_old");
				if (array.split("_")[0] == "group") {
					state[array][i] = duplicateItemAttribute(state[array][i], "_parent", "_parentOld");
				}
			}
		}
	} else if (action.type === "EDITOR_ADD") {
		const array = action.array;
		var uuid = action.key === undefined ? null : action.key;
		var opposite = action.opposite === undefined ? false : action.opposite;
		if (opposite == true) {
			if (uuid == null) {
				uuid = state[array][0]._uuid;
			}
			for (let i = 0; i < state[array].length; i++) {
				var attribute = (new ArrayAttribute(array)).attribute;
				if (state[array][i][attribute] == uuid) {
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
				var index = 0;
			} else {
				for (let i = 0; i < state[array].length; i++) {
					var attribute = (new ArrayAttribute(array)).attribute;
					if (state[array][i][attribute] == uuid) {
						var index = i + 1;
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
		var uuid = action.key === undefined ? null : action.key;
		var opposite = action.opposite === undefined ? false : action.opposite;
		if (array == "group_uuid") {
			var attribute = "_parent";
		} else if (array == "group_parent") {
			var attribute = "_uuid";
		} else {
			var attribute = "_uuid";
		}
		if (uuid == null) {
			uuid = state[array][state[array].length - 1][attribute];
		}
		for (i = 0; i < state[array].length; i++) {
			if (state[array][i][attribute] == uuid) {
				if (opposite == true) {
					delete state[array][i]._remove;
				} else {
					state[array][i]._remove = true;
				}
			}
		}
	} else if (action.type === "EDITOR_UPDATE" || action.type === "EDITOR_UPDATE_AFTER_SEARCH") {
		const array = action.array;
		const attribute = action.attribute;
		const updatedValue = action.updated;
		const index = action.index;
		
		if (action.suppressUpdateKeys === false) {
			// If a key is edited, all instances of that key within the editorReducer's state should also be updated accordingly
			const originalValue = state[array][index][attribute];
			let loop = ["_uuid", "_parent", "_start", "_end"];
			for (let array in state) {
				for (let i = 0; i < state[array].length; i++) {
					for (let j = 0; j < loop.length; j++) {
						let variable = loop[j];
						if (state[array][i]) {
							if (state[array][i][variable]) {
								if (state[array][i][variable] === originalValue) {
									state[array][i][variable] = updatedValue;
								}
							}
						}
					}
				}
			}
		}
		
		state[array][index][attribute] = updatedValue;
	}
	return state;
}

var reduxStore = Redux.createStore(function (state = {
	"selector": JSON.parse(JSON.stringify(initialState)), 
	"editor": {}, 
	"focused": {
		"isRelatedToLastAction": false, 
		"value": false
	}, 
	"suppressUpdateKeys": {
		"isRelatedToLastAction": false, 
		"value": false
	}
}, action = {}) {
	state.focused.isRelatedToLastAction = false;
	state.suppressUpdateKeys.isRelatedToLastAction = false;
	if (action.type.startsWith("SELECTOR")) {
		state.selector = selectorReducer(state.selector, action);
		if (state.selector.editorStoreDispatch !== null) {
			state.editor = editorReducer(state.editor, state.selector.editorStoreDispatch);
			state.selector.editorStoreDispatch = null;
		}
	} else if (action.type.startsWith("EDITOR")) {
		if (action.type === "EDITOR_UPDATE_AFTER_SEARCH") {
			state.focused.isRelatedToLastAction = true;
			state.focused.value = action.array + "_" + action.index + action.attribute;
		}
		state.editor = editorReducer(state.editor, {...action, "suppressUpdateKeys": state.suppressUpdateKeys.value});
	} else if (action.type === "SET_SUPPRESS_UPDATE_KEYS") {
		state.suppressUpdateKeys.isRelatedToLastAction = true;
		state.suppressUpdateKeys.value = action.value;
	}
	return state;
}, /* Redux DevTools for debugging purposes */ window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
	"trace": true, 
	"traceLimit": 100
}));

reduxStore.subscribe(function () {
	var state = reduxStore.getState();
	if (state.suppressUpdateKeys.isRelatedToLastAction === true) return;
	if (JSON.stringify(state.editor) === "{}" && editorAlreadyEmpty !== false) return;
	
	if (state.focused.isRelatedToLastAction === true) {
		ReactDOM.render(<Editor focused={state.focused.value}/>, document.getElementById("sidebar"));
	} else {
		ReactDOM.render(<Editor focused=""/>, document.getElementById("sidebar"));
	}
});

var editorAlreadyEmpty = true;

class Editor extends React.Component {
	constructor () {
		super();
		this.focused = React.createRef();
	}
	
	componentDidMount () {
		if (this.focused.current) this.focused.current.focus();
	}
	
	render () {
		if (JSON.stringify(reduxStore.getState().editor) === "{}") {
			if (editorAlreadyEmpty === false) {
				reduxStore.dispatch({
					"type": "SELECTOR_RESET"
				});
				editorAlreadyEmpty = true;
				document.getElementById("sidebarPreview").innerHTML = "No Content";
				return "No Content";
			}
		} else {
			editorAlreadyEmpty = false;
			
			(function () {
				var editor = reduxStore.getState().editor;
				var arrayList = Object.keys(editor).sort();
				var editorInOrder = {};
				for (let i = 0; i < arrayList.length; i++) {
					editorInOrder[arrayList[i]] = editor[arrayList[i]];
				}
				if (JSON.stringify(editorInOrder) !== "{}") {
					document.getElementById("sidebarPreview").innerHTML = JSON.stringify(editorInOrder, null, 4);
				}
			})();
			
			const seed = Math.random().toString().substring(2);
			return generateEditor(this.props.focused, seed);
		}
	}
}