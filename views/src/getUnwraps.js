import * as Diff from "diff";

export default function getUnwraps (previousTokens, tokens) {
	let changeObjects = Diff.diffArrays(previousTokens, tokens, {
		comparator: (left, right) => {
			if (left.type !== right.type) return false;
			
			const tokenDifferences = Diff.diffJson(left, right);
			for (let index = 0; index < tokenDifferences.length; index++) {
				if (tokenDifferences[index].added === true) return false;
				if (tokenDifferences[index].removed === true) return false;
			}
			
			return true;
		}
	});
	
	let currentCharacter = 0;
	let unwrapAreas = [];
	for (let index = 0; index < changeObjects.length; index++) {
		const changedTokens = changeObjects[index].value;
		const characterCount = changedTokens.reduce((characterCount, currentToken) => {
			characterCount += currentToken.children.join("").length;
			return characterCount;
		}, 0);
		
		if (changeObjects[index].added === true) {
			unwrapAreas.push([currentCharacter, currentCharacter + characterCount]);
		}
		
		currentCharacter += characterCount;
	}
	
	let unwraps = [];
	if (unwrapAreas.length === 0) return unwraps;
	
	currentCharacter = 0;
	currentUnwrapAreaIndex = 0;
	for (let index = 0; index < previousTokens.length; index++) {
		const previousToken = previousTokens[index];
		const characterCount = previousToken.children.join("").length;
		
		if (currentCharacter <= unwrapAreas[currentUnwrapAreaIndex][0] && 
			currentCharacter + characterCount >= unwrapAreas[currentUnwrapAreaIndex][0] && 
			currentCharacter + characterCount <= unwrapAreas[currentUnwrapAreaIndex][1]) {
				unwraps.push(index);
				currentUnwrapAreaIndex++;
				if (unwrapAreas[currentUnwrapAreaIndex] === undefined) break;
			}
		
		currentCharacter += characterCount;
	}
	
	return unwraps;
}