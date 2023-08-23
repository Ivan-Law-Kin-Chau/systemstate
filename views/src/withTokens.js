import {Editor, Node, Path, Text, Transforms} from "slate";

import getUnwraps from "./getUnwraps.js";
import getPossibilities from "./getPossibilities.js";
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
			const tokens = tokenizer.parse(text);
			
			let unwraps = getUnwraps(previousTokens, tokens);
			previousTokens = tokens;
			
			Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
				at: [0], 
				match: (node, path) => path.length === 2 && path[0] === 0 && unwraps.includes(path[1])
			});
			
			Transforms.unsetNodes(editor, ["key", "type", "nominalText", "isToken", "isTracked"], {
				at: [0], 
				match: node => node.isToken === true && node.nominalText !== node.text
			});
			
			Transforms.mergeNodes(editor, {
				at: [0], 
				match: (node, path) => node.isToken !== true && Path.hasPrevious(path) && Text.equals(Node.get(editor, path), Node.get(editor, Path.previous(path)), {loose: true})
			});
			
			const possibilities = getPossibilities(tokens);
			let trackedTokens = getTrackedTokens(editor, possibilities, tokens);
			if (tokens.length === 0) {
				normalizeNode(entry);
				return;
			}
			
			const traverser = new Traverser();
			traverser.setStream("characters", text);
			traverser.setStream("nodes", editor.children[0].children, node => node.text);
			traverser.setStream("tokens", tokens, token => token.children.join(""));
			
			traverser.setListener("tokens", "start", function (state, getIndexes, getPoint, getNodeEntry) {
				if (state.rangesToReset === undefined) state.rangesToReset = [];
				let index = getIndexes().tokens;
				
				// There are three scenarios where a token will have to be normalized. First is if a previously tracked token is no longer tracked. In that case, isStillTracked will be false. Second is if a token not previously tracked will become tracked. In that case, willBeTracked will be true. Third is if a node that has not been rendered as tokens yet is found. In that case, currentNode.isToken will not be true
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
			
			traverser.setListener("tokens", "end", function (state, getIndexes, getPoint, getNodeEntry) {
				if (state.startPoint !== null) {
					state.rangesToReset.push({
						index: getIndexes().tokens, 
						range: Editor.rangeRef(editor, {
							anchor: state.startPoint, 
							focus: getPoint()
						})
					});
				}
				
				state.startPoint = null;
			});
			
			let {rangesToReset} = traverser.traverse();
			
			rangesToReset.forEach(rangeObject => {
				const index = rangeObject.index;
				
				tokensRendered++;
				
				Transforms.setNodes(editor, {
					key: tokensRendered, 
					type: tokens[index].type, 
					text: tokens[index].children.join(""), 
					nominalText: tokens[index].children.join(""), 
					isToken: true
				}, {
					at: rangeObject.range.current, 
					match: Text.isText, 
					split: true
				});
				
				const trackedCurrentTokens = trackedTokens.filter(token => token.index === index);
				if (trackedCurrentTokens.length !== 0) {
					if (trackedCurrentTokens[0].setPoint !== undefined) {
						trackedCurrentTokens[0].setPoint(rangeObject.range.current.anchor);
					}
					
					Transforms.setNodes(editor, {isTracked: true}, {
						at: rangeObject.range.current.anchor.path
					});
				} else {
					Transforms.unsetNodes(editor, "isTracked", {
						at: rangeObject.range.current.anchor.path
					});
				}
				
				rangeObject.range.unref();
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
		
		normalizeNode(entry);
	};
	
	return editor;
}