{
	const convertBracketToType = (leftBracket, rightBracket) => {
		if (leftBracket.children[0] === "{" && rightBracket.children[0] === "}") return "SSUserInterface";
		if (leftBracket.children[0] === "[" && rightBracket.children[0] === "]") return "keyOfTheHead";
		if (leftBracket.children[0] === "(" && rightBracket.children[0] === ")") return "keyOfSomethingElse";
	};
}

expressions
 = (SSUserInterface / keyOfTheHead / keyOfSomethingElse / arrow / keyValuePair / ignoredCharacter)*

SSUserInterface
 = leftBracket:bracketCharacter expressions:expressions rightBracket:bracketCharacter & {
	return convertBracketToType(leftBracket, rightBracket) === "SSUserInterface";
} {
	return {type: "SSUserInterface", children: [leftBracket, ...expressions, rightBracket]};
}

keyOfTheHead
 = leftBracket:bracketCharacter expressions:expressions rightBracket:bracketCharacter & {
	return convertBracketToType(leftBracket, rightBracket) === "keyOfTheHead";
} {
	return {type: "keyOfTheHead", children: [leftBracket, ...expressions, rightBracket]};
}

keyOfSomethingElse
 = leftBracket:bracketCharacter expressions:expressions rightBracket:bracketCharacter & {
	return convertBracketToType(leftBracket, rightBracket) === "keyOfSomethingElse";
} {
	return {type: "keyOfSomethingElse", children: [leftBracket, ...expressions, rightBracket]};
}

bracketCharacter
 = bracketCharacter:[\{\}\[\]\(\)] {
	return {type: "bracketCharacter", isToken: true, children: [bracketCharacter]};
}

arrow
 = arrow:("<->" / "<-" / "->") {
	return {type: "arrow", isToken: true, children: [arrow]};
}

keyValuePair
 = key:string "=" value:string {
	return {type: "keyValuePair", isToken: true, key: key.delimited, value: value.delimited, children: ["\"", key.children[0], "\"=\"", value.children[0], "\""]};
}

string = string:("\"" stringCharacters "\"") {
	return {type: "string", delimited: string[1].delimited, children: [string[1].children[0]]};
}

stringCharacters = stringCharacters:(delimitedEnd / delimitedBackslash / backslash / stringCharacter)* {
	return {type: "stringCharacters", delimited: stringCharacters.reduce((accumulator, currentValue) => {
		return accumulator += currentValue.delimited;
	}, ""), children: [stringCharacters.reduce((accumulator, currentValue) => {
		return accumulator += currentValue.children[0];
	}, "")]};
}

delimitedEnd = delimitedEnd:"\\\"" {
	return {type: "delimiter", delimited: "\"", children: [delimitedEnd]};
}

delimitedBackslash = delimitedBackslash:"\\\\" {
	return {type: "delimiter", delimited: "\\", children: [delimitedBackslash]};
}

backslash = backslash:"\\" {
	return {type: "delimiter", delimited: "", children: [backslash]};
}

stringCharacter = stringCharacter:[^\"] {
	return {type: "stringCharacter", delimited: stringCharacter, children: [stringCharacter]};
}

ignoredCharacter = ignoredCharacter:[ \t\n] {
	return {type: "ignoredCharacter", isToken: true, children: [ignoredCharacter]};
}