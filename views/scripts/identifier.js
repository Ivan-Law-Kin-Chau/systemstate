export function identityToString (type, identity) {
	if (type === "group") {
		var identityString = identity._uuid + "_" + identity._parent;
	} else {
		var identityString = identity._uuid;
	}
	
	return identityString;
}

export function identityFromString (type, identityString) {
	if (type === "group") {
		var identity = {
			_uuid: identityString.split("_")[0], 
			_parent: identityString.split("_")[1]
		};
	} else {
		var identity = {
			_uuid: identityString
		};
	}
	
	return identity;
}