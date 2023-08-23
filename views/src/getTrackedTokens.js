import {Node, Path, Point} from "slate";

import Traverser from "./Traverser.js";

export default function getTrackedTokens (editor, possibilities, tokens) {
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
		const convertPossibilityToEffects = possibility => {
			let trackedIndexes = new Set();
			
			let untrackedIndexes = new Set([
				...possibility.path.map(bracket => bracket[0]), 
				...possibility.path.map(bracket => bracket[1])
			]);
			
			let pointRefsToSplice = new Set(pointRefPairs.map((pointRefPair, index) => index));
			
			const traverser = new Traverser();
			traverser.setStream("characters", Node.string(Node.get(editor, [0])));
			traverser.setStream("nodes", editor.children[0].children, node => node.text);
			traverser.setStream("tokens", tokens, token => token.children.join(""));
			
			traverser.setListener("characters", "start", function (state, getIndexes, getPoint, getNodeEntry) {
				if (state.pointRefsFound === undefined) state.pointRefsFound = pointRefPairs.map(pointRefPair => []);
				const indexes = getIndexes();
				
				for (let pointRefIndex = 0; pointRefIndex < pointRefPairs.length; pointRefIndex++) {
					const openingPoint = pointRefPairs[pointRefIndex].openingPointRef.current;
					const closingPoint = pointRefPairs[pointRefIndex].closingPointRef.current;
					const currentPoint = getPoint();
					
					if (Point.isPoint(currentPoint)) {
						if (Point.isPoint(openingPoint) && Point.equals(currentPoint, openingPoint)) {
							state.pointRefsFound[pointRefIndex][0] = indexes.characters;
						}
						
						if (Point.isPoint(closingPoint) && Point.equals(currentPoint, closingPoint)) {
							state.pointRefsFound[pointRefIndex][1] = indexes.characters;
						}
					}
				}
			});
			
			traverser.setListener("tokens", "start", function (state, getIndexes, getPoint, getNodeEntry) {
				if (state.bracketsFound === undefined) state.bracketsFound = possibility.path.map(bracket => []);
				const indexes = getIndexes();
				
				for (let bracketIndex = 0; bracketIndex < possibility.path.length; bracketIndex++) {
					const bracket = possibility.path[bracketIndex];
					
					if (indexes.tokens === bracket[0]) {
						state.bracketsFound[bracketIndex][0] = indexes.characters;
					}
					
					if (indexes.tokens === bracket[1]) {
						state.bracketsFound[bracketIndex][1] = indexes.characters;
					}
				}
			});
			
			const {pointRefsFound, bracketsFound} = traverser.traverse();
			
			for (let pointRefIndex = 0; pointRefIndex < pointRefsFound.length; pointRefIndex++) {
				for (let bracketIndex = 0; bracketIndex < bracketsFound.length; bracketIndex++) {
					if (pointRefsFound[pointRefIndex][0] === bracketsFound[bracketIndex][0] && 
						pointRefsFound[pointRefIndex][1] === bracketsFound[bracketIndex][1]) {
							const openingPoint = pointRefPairs[pointRefIndex].openingPointRef.current;
							const closingPoint = pointRefPairs[pointRefIndex].closingPointRef.current;
							const bracket = possibility.path[bracketIndex];
							
							if (Point.isPoint(openingPoint) && Point.isPoint(closingPoint)) {
								trackedIndexes.add(bracket[0]);
								trackedIndexes.add(bracket[1]);
								untrackedIndexes.delete(bracket[0]);
								untrackedIndexes.delete(bracket[1]);
								pointRefsToSplice.delete(pointRefIndex);
							}
						}
				}
			}
			
			return {
				trackedIndexes: [...trackedIndexes], 
				untrackedIndexes: [...untrackedIndexes], 
				pointRefsToSplice: [...pointRefsToSplice]
			};
		};
		
		// Find the possibility that will make the fewest tracked tokens become untracked
		let fewestUntrackedIndexes = pointRefPairs.length * 2 + 1;
		let effectsWithFewestUntrackedIndexes = {trackedIndexes: [], untrackedIndexes: [], pointRefsToSplice: []};
		for (let index = 0; index < possibilities.length; index++) {
			const effects = convertPossibilityToEffects(possibilities[index]);
			if (fewestUntrackedIndexes > effects.untrackedIndexes.length) {
				fewestUntrackedIndexes = effects.untrackedIndexes.length;
				effectsWithFewestUntrackedIndexes = effects;
			}
		}
		
		effectsWithFewestUntrackedIndexes.trackedIndexes.forEach(index => trackedTokens.push({index}));
		effectsWithFewestUntrackedIndexes.pointRefsToSplice.forEach(index => pointRefPairs.splice(index, 1));
	}
	
	return trackedTokens;
}