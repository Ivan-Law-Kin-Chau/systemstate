import {Node, Path, Point} from "slate";

import Traverser from "./Traverser.js";

export default function getTrackedTokens (editor, tokens, path) {
	let trackedTokens = [];
	
	const convertTypeToBracket = type => {
		if (type === "SSUserInterface") return "{}";
		if (type === "keyOfTheHead") return "[]";
		if (type === "keyOfSomethingElse") return "()";
	};
	
	const text = Node.string(Node.get(editor, [0]));
	
	const traverser = new Traverser();
	traverser.setStream("characters", text);
	traverser.setStream("nodes", editor.children[0].children, node => node.text);
	traverser.setStream("tokens", tokens, token => token.children.join(""));
	
	traverser.setListener("characters", "start", function (state, getIndexes, getPoint, getNodeEntry) {
		if (state.pointRefsFound === undefined) state.pointRefsFound = pointRefPairs.map(pointRefPair => [null, null]);
		const indexes = getIndexes();
		
		for (let pointRefIndex = 0; pointRefIndex < pointRefPairs.length; pointRefIndex++) {
			if (pointRefPairs[pointRefIndex].openingPointRef === undefined || 
				pointRefPairs[pointRefIndex].closingPointRef === undefined) continue;
			
			const openingPoint = pointRefPairs[pointRefIndex].openingPointRef.current;
			const closingPoint = pointRefPairs[pointRefIndex].closingPointRef.current;
			const currentPoint = getPoint();
			
			if (Point.isPoint(currentPoint)) {
				if (Point.isPoint(openingPoint) && Point.equals(currentPoint, openingPoint)) {
					if (convertTypeToBracket(pointRefPairs[pointRefIndex].type)[0] === text[indexes.characters]) {
						state.pointRefsFound[pointRefIndex][0] = indexes.tokens;
					}
				}
				
				if (Point.isPoint(closingPoint) && Point.equals(currentPoint, closingPoint)) {
					if (convertTypeToBracket(pointRefPairs[pointRefIndex].type)[1] === text[indexes.characters]) {
						state.pointRefsFound[pointRefIndex][1] = indexes.tokens;
					}
				}
			}
		}
	});
	
	const {pointRefsFound} = traverser.traverse();
	if (pointRefsFound !== undefined) {
		for (let pointRefIndex = 0; pointRefIndex < pointRefsFound.length; pointRefIndex++) {
			if (pointRefsFound[pointRefIndex][0] !== null && pointRefsFound[pointRefIndex][1] !== null) {
				trackedTokens.push({index: pointRefsFound[pointRefIndex][0]});
				trackedTokens.push({index: pointRefsFound[pointRefIndex][1]});
			} else {
				pointRefPairs.splice(pointRefIndex, 1);
			}
		}
	}
	
	// path contains all the brackets that have to end up being rendered
	// pointRefsFound contains all the brackets that are currently already rendered
	// Therefore, only the brackets that are in path but not in pointRefFound have to be added
	if (path !== null) {
		// Get the brackets in path that are not in pointRefsFound
		const newBrackets = path.filter(bracket => {
			for (let pointRefIndex = 0; pointRefIndex < pointRefsFound.length; pointRefIndex++) {
				if (pointRefsFound[pointRefIndex][0] === bracket[0] && 
					pointRefsFound[pointRefIndex][1] === bracket[1]) return false;
			}
			
			return true;
		});
		
		const convertBracketToType = bracket => {
			if (bracket === "{" || bracket === "}") return "SSUserInterface";
			if (bracket === "[" || bracket === "]") return "keyOfTheHead";
			if (bracket === "(" || bracket === ")") return "keyOfSomethingElse";
		};
		
		// Add those brackets
		newBrackets.forEach(bracket => {
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
	}
	
	return trackedTokens;
}