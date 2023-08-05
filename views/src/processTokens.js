function recursivelyProcessTokens (tokens, parentStartAt, parentEndAt) {
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
					
					// bracketCharacters are marked with the processed flag below so that they will not be processed again, or else the recursion will never end
					let possibility = structuredClone(tokens);
					possibility[openingBracketIndex].processed = true;
					possibility[closingBracketIndex].processed = true;
					
					possibility = recursivelyProcessTokens(possibility, openingBracketIndex, closingBracketIndex);
					parseTree["open_" + openingBracketIndex]["close_" + closingBracketIndex] = possibility;
					possibilityCount++;
				}
			}
		}
	}
	
	if (possibilityCount === 0) {
		if (hasOrphans(tokens, parentStartAt, parentEndAt) === true) return true;
		return tokens.slice(0, tokens.length).reduce((hasOrphans, token) => {
			if (token.type === "bracketCharacter" && token.processed !== true) hasOrphans = true;
			return hasOrphans;
		}, false);
	} else {
		return parseTree;
	}
}

function hasOrphans (tokens, startAt, endAt) {
	let parseTree = {};
	let possibilityCount = 0;
	
	for (let openingBracketIndex = startAt + 1; openingBracketIndex < endAt; openingBracketIndex++) {
		if (tokens[openingBracketIndex].type === "bracketCharacter") {
			const openingBracketType = ["{", "[", "("].indexOf(tokens[openingBracketIndex].children[0]);
			if (openingBracketType === -1) continue;
			
			for (let closingBracketIndex = openingBracketIndex + 1; closingBracketIndex < endAt; closingBracketIndex++) {
				if (tokens[closingBracketIndex].type === "bracketCharacter") {
					const closingBracketType = ["}", "]", ")"].indexOf(tokens[closingBracketIndex].children[0]);
					if (closingBracketType === -1) continue;
					if (openingBracketType !== closingBracketType) continue;
					
					tokens[openingBracketIndex].checked = true;
					tokens[closingBracketIndex].checked = true;
				}
			}
		}
	}
	
	return tokens.slice(startAt + 1, endAt).reduce((hasOrphans, token) => {
		if (token.type === "bracketCharacter" && token.checked !== true) hasOrphans = true;
		return hasOrphans;
	}, false);
}

function traverseParseTree (parseTree, possibilityObject, currentPath = []) {
	if (typeof parseTree === "object") {
		Object.keys(parseTree).forEach(openKey => {
			Object.keys(parseTree[openKey]).forEach(closeKey => {
				let subPath = structuredClone(currentPath);
				subPath.push([parseInt(openKey.split("_")[1]), parseInt(closeKey.split("_")[1])]);
				
				if (typeof parseTree[openKey][closeKey] === "object") {
					traverseParseTree(parseTree[openKey][closeKey], possibilityObject, subPath);
				} else if (typeof parseTree[openKey][closeKey] === "boolean") {
					// Check whether possibilityObject.possibilities already contain that path or not
					const checkedPath = subPath.sort((a, b) => a[0] - b[0]);
					let duplicateFound = false;
					
					possibilityObject.possibilities.forEach(possibility => {
						if (JSON.stringify(possibility.path) === JSON.stringify(checkedPath)) duplicateFound = true;
					});
					
					if (duplicateFound === false) possibilityObject.possibilities.push({
						path: checkedPath, 
						hasOrphans: parseTree[openKey][closeKey]
					});
				}
			});
		});
	} else if (typeof parseTree === "boolean") {
		possibilityObject.possibilities.push({
			path: [], 
			hasOrphans: parseTree
		});
	}
}

function hasOverlaps (checkedPath) {
	if (checkedPath.length === 1) return false;
	
	let changes = -1;
	while (changes !== 0) {
		changes = 0;
		for (let leftIndex = 0; leftIndex < checkedPath.length; leftIndex++) {
			for (let rightIndex = 0; rightIndex < checkedPath.length; rightIndex++) {
				if (checkedPath[leftIndex][0] < checkedPath[rightIndex][0] && 
					checkedPath[leftIndex][1] > checkedPath[rightIndex][0]) return true;
			}
		}
	}
	
	return false;
}

export default function processTokens (tokens) {
	// Get all possibilities
	const parseTree = recursivelyProcessTokens(tokens);
	
	// Remove duplicates
	let possibilityObject = {possibilities: []};
	traverseParseTree(parseTree, possibilityObject);
	
	// Remove possibilities that have overlapping brackets
	let possibilities = possibilityObject.possibilities;
	for (let index = 0; index < possibilities.length; index++) {
		if (hasOverlaps(possibilities[index].path) === true) possibilities.splice(index, 1);
	}
	
	// Check is there a possibility where all hasOrphans are false
	for (let index = 0; index < possibilities.length; index++) {
		if (possibilities[index].hasOrphans === false) return [
			{
				path: possibilities[index].path, 
				hasOrphans: false
			}
		];
	}
	
	// If there is no such possibility, then return all possibilities
	return possibilities;
}