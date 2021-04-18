executeRewriteRules = function (type, array, index, attribute, item) {
	if (item._name) {
		if (item._name.startsWith("_")) {
			if (type === "textarea" && item._name === "_aliase") return "_aliase";
			if (type === "textarea" && item._name === "_colour") return "_colour";
		}
	}
	return type;
}

userDefinedClasses = function (type, array, index, attribute, item) {
	return {
		"_aliase": {
			"type": "a", 
			"attributes": {
				"id": array + "_" + index + attribute, 
				"href": "javascript:void(0);", 
				"innerHTML": "%%%%%%%%", 
				"value": item[attribute], 
				"style": {
					"color": "#000000", 
					"minWidth": "72px", 
					"maxWidth": "72px", 
					"padding": "0px"
				}
			}, 
			"listeners": [
				{
					"triggers": ["click"], 
					"callback": function () {
						load(this.value);
					}
				}
			]
		}, 
		"_colour": {
			"type": "input", 
			"attributes": {
				"id": array + "_" + index + attribute, 
				"disabled": true, 
				"style": {
					"backgroundColor": item[attribute], 
					"minWidth": "72px", 
					"maxWidth": "72px", 
					"height": simulate("true").height, 
					"padding": "0px"
				}
			}, 
			"listeners": []
		}
	};
}