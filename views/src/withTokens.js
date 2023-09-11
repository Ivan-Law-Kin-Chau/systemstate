import {Editor, Node, Path, Point, Text, Transforms} from "slate";

import getPEGResults from "./getPEGResults.js";
import getChanges from "./getChanges.js";
import getTrackedTokens from "./getTrackedTokens.js";
import Traverser from "./Traverser.js";

export default withTokens = editor => {
	window.pointRefPairs = [];
	
	// Each new token being rendered gets a unique key from this variable so that the default normalizeNode function would not merge tokens with identical tokens before or after them
	window.tokensRendered = -1;
	
	window.previousTokens = [];
	
	const {normalizeNode} = editor;
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		if (node.type === "paragraph" && !Path.equals(path, [0])) {
			tokensRendered++;
			
			Transforms.insertNodes(editor, {key: tokensRendered, type: "ignoredCharacter", text: "\n", nominalText: "\n", isToken: true}, {
				at: [...path, 0]
			});
			
			Transforms.mergeNodes(editor, {
				at: path
			});
			
			return;
		}
		
		let parseRequired = false;
		
		if (Text.isText(node) && Node.parent(editor, path).type === "paragraph" && node.isToken === true && node.text === "") {
			if (Node.parent(editor, path).children.length === 1) {
				Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
					at: path
				});
			} else {
				Transforms.removeNodes(editor, {
					at: path
				});
			}
			
			parseRequired = true;
		}
		
		if (Text.isText(node) && Node.parent(editor, path).type === "paragraph" && (
			node.isToken !== true || 
			(node.isToken === true && node.nominalText !== node.text)
		)) {
			parseRequired = true;
		}
		
		if (parseRequired === true) {
			const text = Node.string(Node.get(editor, [0]));
			const {tokens, path} = getPEGResults(text);
			
			// Find the changes between previousTokens and tokens, and then turn the area affected by each change into a text node that is not a token, so that the tokens within it can be rerendered below
			let changes = getChanges(previousTokens, tokens);
			previousTokens = tokens;
			
			Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
				at: [0], 
				match: (node, path) => path.length === 2 && path[0] === 0 && changes.includes(path[1])
			});
			
			Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
				at: [0], 
				match: node => node.isToken === true && node.nominalText !== node.text
			});
			
			Transforms.mergeNodes(editor, {
				at: [0], 
				match: (node, path) => node.isToken !== true && Path.hasPrevious(path) && Text.equals(Node.get(editor, path), Node.get(editor, Path.previous(path)), {loose: true})
			});
			
			// Find the tracked tokens, as they may have to be rerendered below
			let trackedTokens = getTrackedTokens(editor, tokens, path);
			if (tokens.length !== 0) {
				// Figure out what are the tokens that have to be rerendered
				const traverser = new Traverser();
				traverser.setStream("characters", text);
				traverser.setStream("nodes", editor.children[0].children, node => node.text);
				traverser.setStream("tokens", tokens, token => token.children.join(""));
				
				traverser.addListener("tokens", "start", function (state, getIndexes, getPoint, getNodeEntry) {
					if (state.tokensToRerender === undefined) state.tokensToRerender = [];
					let index = getIndexes().tokens;
					
					// There are three kinds of tokens that have to be rerendered. First is if a previously tracked token is no longer tracked. In that case, isStillTracked will be false. Second is if a token not previously tracked will become tracked. In that case, willBeTracked will be true. Third is if a node that has not been rendered as tokens yet is found. In that case, currentNode.isToken will not be true
					let isStillTracked = null;
					let willBeTracked = null;
					
					const [currentNode, currentPath] = getNodeEntry();
					if (currentNode.isTracked === true) {
						isStillTracked = false;
						for (let trackedTokenIndex = 0; trackedTokenIndex < trackedTokens.length; trackedTokenIndex++) {
							if (trackedTokens[trackedTokenIndex].index === index) {
								isStillTracked = true;
								break;
							}
						}
					} else {
						willBeTracked = false;
						for (let trackedTokenIndex = 0; trackedTokenIndex < trackedTokens.length; trackedTokenIndex++) {
							if (trackedTokens[trackedTokenIndex].index === index) {
								willBeTracked = true;
								break;
							}
						}
					}
					
					if (currentNode.isToken !== true || isStillTracked === false || willBeTracked === true) {
						state.startPoint = getPoint();
					} else {
						state.startPoint = null;
					}
				});
				
				traverser.addListener("tokens", "end", function (state, getIndexes, getPoint, getNodeEntry) {
					if (state.startPoint !== null) {
						state.tokensToRerender.push({
							index: getIndexes().tokens, 
							range: Editor.rangeRef(editor, {
								anchor: state.startPoint, 
								focus: getPoint()
							})
						});
					}
					
					state.startPoint = null;
				});
				
				let {tokensToRerender} = traverser.traverse();
				
				// Rerender the tokens that have to be rerendered
				tokensToRerender.forEach(tokenRangeObject => {
					const index = tokenRangeObject.index;
					
					tokensRendered++;
					
					Transforms.setNodes(editor, {
						key: tokensRendered, 
						type: tokens[index].type, 
						text: tokens[index].children.join(""), 
						nominalText: tokens[index].children.join(""), 
						isToken: true
					}, {
						at: tokenRangeObject.range.current, 
						match: Text.isText, 
						split: true
					});
					
					const trackedCurrentTokens = trackedTokens.filter(token => token.index === index);
					if (trackedCurrentTokens.length !== 0) {
						if (trackedCurrentTokens[0].setPoint !== undefined) {
							trackedCurrentTokens[0].setPoint(tokenRangeObject.range.current.anchor);
						}
						
						Transforms.setNodes(editor, {isTracked: true}, {
							at: tokenRangeObject.range.current.anchor.path
						});
					} else {
						Transforms.unsetNodes(editor, "isTracked", {
							at: tokenRangeObject.range.current.anchor.path
						});
					}
					
					tokenRangeObject.range.unref();
				});
				
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
		}
		
		if (Text.isText(node) && Node.parent(editor, path).type === "paragraph" && node.isToken === true && node.text.charAt(node.text.length - 1) === "\n") {
			let transformed = false;
			
			if (Point.isPoint(editor.selection.anchor) && 
				Point.equals(editor.selection.anchor, {path: path, offset: node.text.length}) && 
				Node.has(editor, Path.next(path))) {
					Transforms.setPoint(editor, {path: Path.next(path), offset: 0}, {edge: "anchor"});
					transformed = true;
				}
			
			if (Point.isPoint(editor.selection.focus) && 
				Point.equals(editor.selection.focus, {path: path, offset: node.text.length}) && 
				Node.has(editor, Path.next(path))) {
					Transforms.setPoint(editor, {path: Path.next(path), offset: 0}, {edge: "focus"});
					transformed = true;
				}
			
			if (transformed === true) return;
		}
		
		normalizeNode(entry);
	};
	
	return editor;
}