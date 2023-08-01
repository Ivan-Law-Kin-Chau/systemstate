export default function processTokens (tokens) {
	let parseTree = {};
	let possibilityCount = 0;
	
	for (let openingBracketIndex = 0; openingBracketIndex < tokens.length; openingBracketIndex++) {
		if (tokens[openingBracketIndex].type === "bracketCharacter") {
			if (tokens[openingBracketIndex].processed === true) continue;
			const openingBracketType = ["{", "[", "("].indexOf(tokens[openingBracketIndex].children[0]);
			if (openingBracketType === -1) continue;
			
			for (let closingBracketIndex = openingBracketIndex + 1; closingBracketIndex < tokens.length; closingBracketIndex++) {
				if (tokens[closingBracketIndex].type === "bracketCharacter") {
					if (tokens[closingBracketIndex].processed === true) continue;
					const closingBracketType = ["}", "]", ")"].indexOf(tokens[closingBracketIndex].children[0]);
					if (closingBracketType === -1) continue;
					if (openingBracketType !== closingBracketType) continue;
					if (parseTree["open_" + openingBracketIndex] === undefined) parseTree["open_" + openingBracketIndex] = {};
					
					let possibility = [];
					for (let index = 0; index < tokens.length; index++) {
						possibility.push(structuredClone(tokens[index]));
					}
					
					// Mark bracketCharacters that have already been processed with a flag so that they will not be processed again, or else the recursion will never end
					possibility[openingBracketIndex].processed = true;
					possibility[closingBracketIndex].processed = true;
					
					possibility = processTokens(possibility);
					parseTree["open_" + openingBracketIndex]["close_" + closingBracketIndex] = possibility;
					possibilityCount++;
				}
			}
		}
	}
	
	if (possibilityCount === 0) {
		return {};
	} else {
		return parseTree;
	}
}