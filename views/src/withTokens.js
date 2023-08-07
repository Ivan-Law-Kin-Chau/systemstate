import {Editor, Node, Path, Point, Text, Transforms} from "slate";

import getPossibilities from "./getPossibilities.js";

export default withTokens = (editor, tokenizer) => {
	editor.isInline = element => {
		if (element.isToken === true) return true;
		return false;
	}
	
	window.pointRefPairs = [];
	const {normalizeNode} = editor;
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		if (Text.isText(Node.get(editor, path)) && 
			Node.parent(editor, path).type === "paragraph" && 
			Node.parent(editor, path).children.length === 1) {
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
						// Delete all brackets within the same paragraph
						for (let index = 0; index < pointRefPairs.length; index++) {
							if (pointRefPairs[index].openingPointRef.current !== null && 
								pointRefPairs[index].openingPointRef.current.path[0] !== path[0]) continue;
							if (pointRefPairs[index].closingPointRef.current !== null && 
								pointRefPairs[index].closingPointRef.current.path[0] !== path[0]) continue;
							pointRefPairs.splice(index, 1);
						}
					} else {
						// Delete the brackets that no longer exist within the same paragraph
						for (let index = 0; index < pointRefPairs.length; index++) {
							if (pointRefPairs[index].openingPointRef.current !== null && 
								pointRefPairs[index].openingPointRef.current.path[0] !== path[0]) continue;
							if (pointRefPairs[index].closingPointRef.current !== null && 
								pointRefPairs[index].closingPointRef.current.path[0] !== path[0]) continue;
							
							let bracketStillExists = false;
							
							possibilityWithHighestScore.path.forEach(bracket => {
								if (pointRefPairs[index].openingPointRef.current === null) return;
								if (pointRefPairs[index].openingPointRef.current.offset !== bracket[0]) return;
								if (pointRefPairs[index].closingPointRef.current === null) return;
								if (pointRefPairs[index].closingPointRef.current.offset !== bracket[1]) return;
								bracketStillExists = true;
								
								trackedTokens.push({index: bracket[0]});
								trackedTokens.push({index: bracket[1]});
							});
							
							if (bracketStillExists === false) pointRefPairs.splice(index, 1);
						}
					}
				}
				
				let incrementablePath = structuredClone(path);
				
				for (let index = 0; index < tokens.length; index++) {
					let currentToken = structuredClone(tokens[index]);
					currentToken.children = [{text: currentToken.children.join("")}];
					currentToken.nominalChildren = currentToken.children;
					currentToken.isToken = true;
					
					Transforms.wrapNodes(editor, currentToken, {
						at: {
							anchor: {path: incrementablePath, offset: 0}, 
							focus: {path: incrementablePath, offset: tokens[index].children.join("").length}
						}, 
						match: Text.isText, 
						split: true
					});
					
					const trackedCurrentTokens = trackedTokens.filter(bracket => bracket.index === index);
					if (trackedCurrentTokens.length > 0) {
						// Set the opening or closing point of a pointRefPair. The point's path points to the text node within the token node, instead of the token node itself. That is because the token node may get unwrapped in the future, after which the token node will stop existing for a short moment of time. If the point's path points to the token node, then when this happens, the point's path will be pointing to a node that no longer exists, which makes it null. However, if the point's path points to the text node within the token node instead, then the point's path will be pointing to a node that still exists, which does not make it null
						if (trackedCurrentTokens[0].setPoint !== undefined) {
							trackedCurrentTokens[0].setPoint({path: [...incrementablePath, 0], offset: 0});
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
			JSON.stringify(node.nominalChildren) !== JSON.stringify(node.children)) {
				Transforms.unwrapNodes(editor, {
					at: Path.parent(path), 
					match: node => node.isToken === true, 
					split: true
				});
			}
		
		normalizeNode(entry);
	};
	
	return editor;
}