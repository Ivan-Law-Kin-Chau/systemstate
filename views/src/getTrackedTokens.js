import {Node} from "slate";

import Traverser from "./Traverser.js";
import Tracked from "./Tracked.js";

export default function getTrackedTokens (editor, tokens, path) {
	let trackedTokens = [];
	
	const text = Node.string(Node.get(editor, [0]));
	
	const traverser = new Traverser();
	traverser.setStream("characters", text);
	traverser.setStream("nodes", editor.children[0].children, node => node.text);
	traverser.setStream("tokens", tokens, token => token.children.join(""));
	
	rootTracked.recursivelyCall(tracked => tracked.addListenerToTraverser(text, traverser));
	traverser.traverse();
	
	rootTracked.recursivelyCall(tracked => tracked.handleTraverseResults(trackedTokens));
	
	// path contains all the brackets that have to end up being rendered
	// rootTracked contains all the brackets that are currently already rendered
	// Therefore, only the brackets that are in path but not in rootTracked have to be added
	if (path !== null) {
		// Remove the brackets in path that are already in rootTracked
		rootTracked.recursivelyCall(tracked => {
			if (["SSUserInterface", "keyOfTheHead", "keyOfSomethingElse"].includes(tracked.type)) {
				path.forEach((bracket, index) => {
					if (tracked.dependencies.opening.index === bracket[0] && 
						tracked.dependencies.closing.index === bracket[1]) path.splice(index, 1);
				});
			}
		});
		
		const convertTypeToBracket = type => {
			if (type === "SSUserInterface") return "{}";
			if (type === "keyOfTheHead") return "[]";
			if (type === "keyOfSomethingElse") return "()";
		};
		
		const convertBracketToType = bracket => {
			if (bracket === "{" || bracket === "}") return "SSUserInterface";
			if (bracket === "[" || bracket === "]") return "keyOfTheHead";
			if (bracket === "(" || bracket === ")") return "keyOfSomethingElse";
		};
		
		// Add those brackets
		path.forEach(bracket => {
			const opening = tokens[bracket[0]].children[0];
			const closing = tokens[bracket[1]].children[0];
			
			if (convertBracketToType(opening) === convertBracketToType(closing)) {
				const tracked = new Tracked(convertBracketToType(opening), {
					opening: {index: bracket[0], character: opening}, 
					closing: {index: bracket[1], character: closing}
				});
				
				trackedTokens.push({
					index: bracket[0], 
					setPoint: point => tracked.dependencies.opening.point = point
				});
				
				trackedTokens.push({
					index: bracket[1], 
					setPoint: point => tracked.dependencies.closing.point = point
				});
				
				rootTracked.addChild(tracked);
			}
		});
	}
	
	return trackedTokens;
}