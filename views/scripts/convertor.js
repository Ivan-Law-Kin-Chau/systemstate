export function convertHTMLToBoolean (input) {
	if (input == null) {
		return null;
	} else if (input == "1") {
		return true;
	} else if (input == "0") {
		return false;
	} else {
		throw "Conversion error: " + input;
	}
}

export function convertBooleanToHTML (input) {
	if (input === null) {
		return null;
	} else if (input === true) {
		return "1";
	} else if (input === false) {
		return "0";
	} else {
		throw "Conversion error: " + input;
	}
}

export function convertBooleanToDirection (input) {
	if (input === null) {
		return "<->";
	} else if (input === true) {
		return "->";
	} else if (input === false) {
		return "<-";
	} else {
		throw "Conversion error: " + input;
	}
}

export function convertCamelCaseToSS (input) {
	if (typeof input === "string") {
		return "SS" + input[0].toUpperCase() + input.slice(1);
	} else {
		throw "Conversion error: " + input;
	}
}