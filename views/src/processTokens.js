function findPossibilities (path = [], searchedIndexes = [], continueAt = -1) {
	let possibilitiesFound = 0;
	
	for (let openingBracketIndex = continueAt + 1; openingBracketIndex < this.tokens.length; openingBracketIndex++) {
		if (this.tokens[openingBracketIndex].type !== "bracketCharacter") continue;
		if (searchedIndexes.includes(openingBracketIndex)) continue;
		const openingBracketType = ["{", "[", "("].indexOf(this.tokens[openingBracketIndex].children[0]);
		if (openingBracketType === -1) continue;
		
		for (let closingBracketIndex = openingBracketIndex + 1; closingBracketIndex < this.tokens.length; closingBracketIndex++) {
			if (this.tokens[closingBracketIndex].type !== "bracketCharacter") continue;
			if (searchedIndexes.includes(closingBracketIndex)) continue;
			const closingBracketType = ["}", "]", ")"].indexOf(this.tokens[closingBracketIndex].children[0]);
			if (closingBracketType === -1) continue;
			if (openingBracketType !== closingBracketType) continue;
			
			let newSearchedIndexes = structuredClone(searchedIndexes);
			newSearchedIndexes.push(openingBracketIndex);
			newSearchedIndexes.push(closingBracketIndex);
			
			const possibilityWithoutOrphansFound = findPossibilities.bind(this)([...path, [openingBracketIndex, closingBracketIndex]], newSearchedIndexes, openingBracketIndex);
			if (possibilityWithoutOrphansFound === true) return true;
			
			possibilitiesFound++;
		}
	}
	
	if (possibilitiesFound === 0 && hasOverlaps(path) === false) {
		this.possibilities.push({
			path: path, 
			hasOrphans: searchedIndexes.length !== this.tokens.length
		});
		
		if (this.possibilities[this.possibilities.length - 1].hasOrphans === false) {
			this.possibilities.splice(0, this.possibilities.length - 1);
			return true;
		} else {
			return false;
		}
	}
}

function hasOverlaps (path) {
	if (path.length === 1) return false;
	
	for (let leftIndex = 0; leftIndex < path.length; leftIndex++) {
		for (let rightIndex = 0; rightIndex < path.length; rightIndex++) {
			if (path[leftIndex][0] < path[rightIndex][0] && 
				path[leftIndex][1] > path[rightIndex][0] && 
				path[leftIndex][1] < path[rightIndex][1]) return true;
		}
	}
	
	return false;
}

export default function processTokens (tokens) {
	this.tokens = tokens;
	this.possibilities = [];
	findPossibilities.bind(this)();
	return this.possibilities;
}