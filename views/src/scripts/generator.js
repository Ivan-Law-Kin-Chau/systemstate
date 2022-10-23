export function generateKey () {
	var key = "";
	
	for (let i = 0; i < 8; i++) {
		key += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36));
	}
	
	return key;
}

export function generateIdentity (generateKey, table) {
	if (typeof generateKey !== "function") throw "Invalid generateKey";
	if (table === "object" || table === "link" || table === "property") {
		return {
			_uuid: generateKey()
		};
	} else if (table === "group") {
		return {
			_uuid: generateKey(), 
			_parent: generateKey()
		};
	} else {
		throw "Invalid table";
	}
}