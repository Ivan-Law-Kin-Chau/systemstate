import {Editor, Node, Path, Point, Text, Transforms} from "slate";

import getPossibilities from "./getPossibilities.js";

export default withTokens = (editor, tokenizer) => {
	window.pointRefPairs = [];
	
	// Each new token being rendered gets a unique key from this variable so that the default normalizeNode function would not merge tokens with identical tokens before or after them
	window.tokensRendered = -1;
	
	const {normalizeNode} = editor;
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		if (node.type === "paragraph" && 
			!Path.equals(path, [0])) {
				tokensRendered++;
				
				Transforms.insertNodes(editor, {key: tokensRendered, type: "ignoredCharacter", text: "\n", nominalText: "\n", isToken: true}, {
					at: [...path, 0]
				});
				
				Transforms.mergeNodes(editor, {
					at: path
				});
				
				return;
			}
		
		if (Text.isText(Node.get(editor, path)) && 
			Node.parent(editor, path).type === "paragraph" && 
			node.isToken !== true) {
				const tokens = tokenizer.parse(Node.get(editor, path).text);
				let possibilities = getPossibilities(tokens);
				
				let trackedTokens = [];
				const convertBracketToType = bracket => {
					if (bracket === "{" || bracket === "}") return "SSUserInterface";
					if (bracket === "[" || bracket === "]") return "keyOfTheHead";
					if (bracket === "(" || bracket === ")") return "keyOfSomethingElse";
				};
				
				// If there is a way to pair all open brackets to close brackets and leave no orphans
				if (possibilities.length === 1 && possibilities[0].hasOrphans === false) {
					pointRefPairs = [];
					possibilities[0].path.forEach(bracket => {
						const openingBracket = tokens[bracket[0]].children[0];
						const closingBracket = tokens[bracket[1]].children[0];
						if (convertBracketToType(openingBracket) === convertBracketToType(closingBracket)) {
							const newPointRefPair = {type: convertBracketToType(openingBracket), notCreated: true};
							
							trackedTokens.push({
								index: bracket[0], 
								setPoint: point => newPointRefPair.openingPoint = point
							});
							
							trackedTokens.push({
								index: bracket[1], 
								setPoint: point => newPointRefPair.closingPoint = point
							});
							
							pointRefPairs.push(newPointRefPair);
						}
					});
				// If there is no such way, but there are records from the last time when there was such a way
				} else if (pointRefPairs.length !== 0) {
					const possibilityScores = structuredClone(possibilities).map(subPath => {
						let pointRefPairsFound = 0;
						
						const brackets = subPath.path;
						brackets.forEach(bracket => {
							pointRefPairs.forEach(pointRefPair => {
								const openingPoint = pointRefPair.openingPointRef.current;
								if (!Point.isPoint(openingPoint)) return;
								if (!Path.equals(openingPoint.path, path)) return;
								if (openingPoint.offset !== bracket[0]) return;
								
								const closingPoint = pointRefPair.closingPointRef.current;
								if (!Point.isPoint(closingPoint)) return;
								if (!Path.equals(closingPoint.path, path)) return;
								if (closingPoint.offset !== bracket[1]) return;
								
								if (convertBracketToType(tokens[bracket[0]].children[0]) === pointRefPair.type && 
									convertBracketToType(tokens[bracket[1]].children[0]) === pointRefPair.type) pointRefPairsFound++;
							});
						});
						
						return pointRefPairsFound;
					});
					
					let highestScore = -1;
					let possibilityWithHighestScore = null;
					for (let index = 0; index < possibilities.length; index++) {
						if (highestScore < possibilityScores[index]) {
							highestScore = possibilityScores[index];
							possibilityWithHighestScore = possibilities[index];
						}
					}
					
					if (possibilityWithHighestScore === null) {
						// Delete all brackets
						pointRefPairs = [];
					} else {
						// Delete the brackets that no longer exist
						let pointRefIndexesToSplice = [];
						
						for (let pointRefIndex = 0; pointRefIndex < pointRefPairs.length; pointRefIndex++) {
							let bracketStillExists = false;
							
							for (let bracketIndex = 0; bracketIndex < possibilityWithHighestScore.path.length; bracketIndex++) {
								const bracket = possibilityWithHighestScore.path[bracketIndex];
								if (pointRefPairs[pointRefIndex].openingPointRef.current === null) continue;
								if (pointRefPairs[pointRefIndex].openingPointRef.current.offset !== bracket[0]) continue;
								if (pointRefPairs[pointRefIndex].closingPointRef.current === null) continue;
								if (pointRefPairs[pointRefIndex].closingPointRef.current.offset !== bracket[1]) continue;
								bracketStillExists = true;
								
								trackedTokens.push({index: bracket[0]});
								trackedTokens.push({index: bracket[1]});
							}
							
							// If the splice is performed immediately, then it will decrease the indexes of the remaining elements in the pointRefPairs array, which will make the value of pointRefIndex < pointRefPairs.length true earlier than it should, ending the for loop. Therefore, the pointRefIndexes to splice are kept at a variable, and the actual splices are performed after the for loop ends
							if (bracketStillExists === false) pointRefIndexesToSplice.push(pointRefIndex);
						}
						
						pointRefIndexesToSplice.forEach(pointRefIndex => pointRefPairs.splice(pointRefIndex, 1));
					}
				}
				
				let incrementablePath = structuredClone(path);
				
				for (let index = 0; index < tokens.length; index++) {
					tokensRendered++;
					
					Transforms.setNodes(editor, {
						key: tokensRendered, 
						type: tokens[index].type, 
						text: tokens[index].children.join(""), 
						nominalText: tokens[index].children.join(""), 
						isToken: true
					}, {
						at: {
							anchor: {path: incrementablePath, offset: 0}, 
							focus: {path: incrementablePath, offset: tokens[index].children.join("").length}
						}, 
						match: Text.isText, 
						split: true
					});
					
					const trackedCurrentTokens = trackedTokens.filter(bracket => bracket.index === index);
					if (trackedCurrentTokens.length > 0) {
						if (trackedCurrentTokens[0].setPoint !== undefined) {
							trackedCurrentTokens[0].setPoint({path: incrementablePath, offset: 0});
						}
						
						Transforms.setNodes(editor, {isTracked: true}, {
							at: incrementablePath, 
							match: node => node.isToken === true, 
							split: true
						});
					}
					
					incrementablePath = Path.next(incrementablePath);
				}
				
				pointRefPairs.forEach(pointRefPair => {
					if (pointRefPair.notCreated === true) {
						delete pointRefPair.notCreated;
						
						pointRefPair.openingPointRef = Editor.pointRef(editor, pointRefPair.openingPoint);
						delete pointRefPair.openingPoint;
						
						pointRefPair.closingPointRef = Editor.pointRef(editor, pointRefPair.closingPoint);
						delete pointRefPair.closingPoint;
					}
				});
			}
		
		if (node.isToken === true && 
			node.nominalText !== node.text) {
				const previousAnchorPath = editor.selection.anchor.path;
				
				[...Node.children(editor, Path.parent(path), {reverse: true})].forEach(childNodeEntry => {
					let [childNode, childPath] = childNodeEntry;
					
					Transforms.mergeNodes(editor, {
						at: childPath
					});
				});
				
				Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
					at: [0, 0]
				});
			}
		
		normalizeNode(entry);
	};
	
	return editor;
}