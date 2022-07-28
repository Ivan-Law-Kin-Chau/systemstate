export function generateKey () {
	var key = "";
	
	for (let i = 0; i < 8; i++) {
		key += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36));
	}
	
	return key;
}

export function generateIdentity (generateKey, type) {
	if (typeof generateKey !== "function") throw "Invalid generateKey";
	if (type === "object" || type === "link" || type === "property") {
		return {
			_uuid: generateKey()
		};
	} else if (type === "group") {
		return {
			_uuid: generateKey(), 
			_parent: generateKey()
		};
	} else {
		throw "Invalid type";
	}
}