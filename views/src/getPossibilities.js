export default function getPossibilities (tokens) {
	let possibilities = [];
	
	const findPossibilities = (path = [], searchedIndexes = [], continueAt = -1) => {
		let possibilitiesFound = 0;
		
		for (let openingBracketIndex = continueAt + 1; openingBracketIndex < tokens.length; openingBracketIndex++) {
			if (tokens[openingBracketIndex].type !== "bracketCharacter") continue;
			if (searchedIndexes.includes(openingBracketIndex)) continue;
			const openingBracketType = ["{", "[", "("].indexOf(tokens[openingBracketIndex].children[0]);
			if (openingBracketType === -1) continue;
			
			for (let closingBracketIndex = openingBracketIndex + 1; closingBracketIndex < tokens.length; closingBracketIndex++) {
				if (tokens[closingBracketIndex].type !== "bracketCharacter") continue;
				if (searchedIndexes.includes(closingBracketIndex)) continue;
				const closingBracketType = ["}", "]", ")"].indexOf(tokens[closingBracketIndex].children[0]);
				if (closingBracketType === -1) continue;
				if (openingBracketType !== closingBracketType) continue;
				if (hasBreachedBracketBoundary(path, [openingBracketIndex, closingBracketIndex])) continue;
				
				let newSearchedIndexes = structuredClone(searchedIndexes);
				newSearchedIndexes.push(openingBracketIndex);
				newSearchedIndexes.push(closingBracketIndex);
				
				const possibilityWithoutOrphansFound = findPossibilities([...path, [openingBracketIndex, closingBracketIndex]], newSearchedIndexes, openingBracketIndex);
				if (possibilityWithoutOrphansFound === true) return true;
				
				possibilitiesFound++;
			}
		}
		
		if (possibilitiesFound === 0) {
			possibilities.push({
				path: path, 
				hasOrphans: hasOrphans(path)
			});
			
			if (possibilities[possibilities.length - 1].hasOrphans === false) {
				possibilities.splice(0, possibilities.length - 1);
				return true;
			} else {
				return false;
			}
		}
	};
	
	// Detects if a pair of brackets breaches any bracket boundary within a certain path, such as in "[(])", where the pair of brackets "()" breaches the boundary of the pair of brackets "[]". This function assumes that a new pair of brackets can only breach bracket boundaries of pre-existing pairs of brackets with a lower openingBracketIndex than the new pair of brackets, because this function is only called in the findPossibilities function, where pre-existing pairs of brackets always have a lower openingBracketIndex than a new pair of brackets
	const hasBreachedBracketBoundary = (path, bracket) => {
		if (path.length === 0) return false;
		
		for (let index = 0; index < path.length; index++) {
			if (path[index][0] < bracket[0] && 
				path[index][1] > bracket[0] && 
				path[index][1] < bracket[1]) return true;
		}
		
		return false;
	};
	
	// Detects orphaned brackets, such as in "[]]", where no matter how you pair opening bracketCharacters to closing bracketCharacters, there will always be a bracketCharacter left that cannot be paired
	const hasOrphans = path => {
		const bracketCharacterCount = tokens.reduce((bracketCharacterCount, currentToken) => {
			if (currentToken.type === "bracketCharacter") bracketCharacterCount++;
			return bracketCharacterCount;
		}, 0);
		
		return path.length * 2 !== bracketCharacterCount;
	};
	
	findPossibilities();
	return possibilities;
}