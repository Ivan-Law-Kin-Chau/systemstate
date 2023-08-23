import * as Diff from "diff";

export default function getChanges (previousTokens, tokens) {
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
	let changedAreas = [];
	for (let index = 0; index < changeObjects.length; index++) {
		const changedTokens = changeObjects[index].value;
		const characterCount = changedTokens.reduce((characterCount, currentToken) => {
			characterCount += currentToken.children.join("").length;
			return characterCount;
		}, 0);
		
		if (changeObjects[index].added === true) {
			changedAreas.push([currentCharacter, currentCharacter + characterCount]);
		}
		
		currentCharacter += characterCount;
	}
	
	let changes = [];
	if (changedAreas.length === 0) return changes;
	
	currentCharacter = 0;
	currentChangedAreaIndex = 0;
	for (let index = 0; index < previousTokens.length; index++) {
		const previousToken = previousTokens[index];
		const characterCount = previousToken.children.join("").length;
		
		if (currentCharacter <= changedAreas[currentChangedAreaIndex][0] && 
			currentCharacter + characterCount >= changedAreas[currentChangedAreaIndex][0] && 
			currentCharacter + characterCount <= changedAreas[currentChangedAreaIndex][1]) {
				changes.push(index);
				currentChangedAreaIndex++;
				if (changedAreas[currentChangedAreaIndex] === undefined) break;
			}
		
		currentCharacter += characterCount;
	}
	
	return changes;
}