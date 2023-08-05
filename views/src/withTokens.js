import {Editor, Node, Path, Point, Text, Transforms} from "slate";

import processTokens from "./processTokens.js";

export default withTokens = (editor, tokenizer) => {
	editor.isInline = element => {
		if (element.isToken === true) return true;
		return false;
	}
	
	window.pointRefPairs = [];
	const {normalizeNode} = editor;
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		Editor.withoutNormalizing(editor, () => {
			if (Text.isText(Node.get(editor, path)) && 
				Node.parent(editor, path).type === "paragraph" && 
				Node.parent(editor, path).children.length === 1) {
					const tokens = tokenizer.parse(Node.get(editor, path).text);
					let tokenCallbacks = tokens.map(token => null);
					
					const possibilities = processTokens(tokens);
					
					// If there is a way to pair all open brackets to close brackets and leave no orphans
					if (possibilities.length === 1 && possibilities[0].hasOrphans === false) {
						pointRefPairs = [];
						possibilities[0].path.forEach(bracket => {
							const newPointRefPair = {notCreated: true};
							const openingBracket = tokens[bracket[0]].children[0];
							const closingBracket = tokens[bracket[1]].children[0];
							if (openingBracket === "{" && closingBracket === "}") newPointRefPair.type = "SSUserInterface";
							if (openingBracket === "[" && closingBracket === "]") newPointRefPair.type = "keyOfTheHead";
							if (openingBracket === "(" && closingBracket === ")") newPointRefPair.type = "keyOfSomethingElse";
							tokenCallbacks[bracket[0]] = point => newPointRefPair.openingPoint = point;
							tokenCallbacks[bracket[1]] = point => newPointRefPair.closingPoint = point;
							pointRefPairs.push(newPointRefPair);
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
									if (!openingPoint.path.slice(0, openingPoint.path.length - 1) === path) return;
									if (!openingPoint.path[openingPoint.path.length - 1] === bracket[0]) return;
									if (!openingPoint.offset === 0) return;
									
									const closingPoint = pointRefPair.closingPointRef.current;
									if (!Point.isPoint(closingPoint)) return;
									if (!closingPoint.path.slice(0, closingPoint.path.length - 1) === path) return;
									if (!closingPoint.path[closingPoint.path.length - 1] === bracket[0]) return;
									if (!closingPoint.offset === 0) return;
									
									pointRefPairsFound++;
								});
							});
							
							return pointRefPairsFound;
						});
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
						
						// This callback will set the opening or closing point of a pointRefPair
						if (tokenCallbacks[index] !== null) {
							// The point's path points to the text node within the token node, instead of the token node itself. That is because the token node may get unwrapped in the future, after which the token node will stop existing for a short moment of time. If the point's path points to the token node, then when this happens, the point's path will be pointing to a node that no longer exists, which makes it null. However, if the point's path points to the text node within the token node instead, then the point's path will be pointing to a node that still exists, which does not make it null
							tokenCallbacks[index]({path: [...incrementablePath, 0], offset: 0});
							tokenCallbacks[index] = null;
							Transforms.setNodes(editor, {isTracked: true}, {
								at: incrementablePath, 
								match: node => node.isToken === true, 
								split: true
							});
						}
						
						incrementablePath = Path.next(incrementablePath);
					}
				}
			
			if (node.isToken === true && 
				JSON.stringify(node.nominalChildren) !== JSON.stringify(node.children)) {
					Transforms.unwrapNodes(editor, {
						at: Path.parent(path), 
						match: node => node.isToken === true, 
						split: true
					});
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
		});
		
		normalizeNode(entry);
	};
	
	return editor;
}