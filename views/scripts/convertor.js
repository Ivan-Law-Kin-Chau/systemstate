export function convertHTMLToBoolean (input) {
	if (input == null) {
		return null;
	} else if (input == "1") {
		return true;
	} else if (input == "0") {
		return false;
	}
}

export function convertBooleanToHTML (input) {
	if (input === null) {
		return null;
	} else if (input === true) {
		return "1";
	} else if (input === false) {
		return "0";
	}
}

export function convertBooleanToDirection (input) {
	if (input === null) {
		return "<->";
	} else if (input === true) {
		return "->";
	} else if (input === false) {
		return "<-";
	}
}