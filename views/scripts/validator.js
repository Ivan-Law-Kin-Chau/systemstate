export function isValidKey (input) {
	if (typeof input !== "string") return false;
	if (input.length !== 8) return false;
	
	for (let i = 0; i < 8; i++) {
		if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".indexOf(input.charAt(i)) === -1) return false;
	}
	
	return true;
}

export function isValidDirection (input) {
	if (input === true || input === false || input === null) return true;
	return false;
}

export function isValidSingleLineString (input) {
	if (typeof input !== "string") return false;
	if (input.indexOf("\r") !== -1) return false;
	if (input.indexOf("\n") !== -1) return false;
	return true;
}

export function isValidMultiLineString (input) {
	if (typeof input !== "string") return false;
	return true;
}