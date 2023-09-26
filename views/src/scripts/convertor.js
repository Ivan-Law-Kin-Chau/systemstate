export function convertCamelCaseToSS (input) {
	if (typeof input === "string") {
		return "SS" + input[0].toUpperCase() + input.slice(1);
	} else {
		throw "Conversion error: " + input;
	}
}