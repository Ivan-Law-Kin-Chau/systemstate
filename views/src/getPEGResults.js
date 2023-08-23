export default function getPEGResults (text) {
	const flattenParseTree = parseTree => {
		const tokens = [];
		const path = [];
		
		const flatten = parseTree => {
			for (let index = 0; index < parseTree.length; index++) {
				if (parseTree[index].isToken === true) {
					tokens.push(parseTree[index]);
				} else {
					const openingBracketIndex = tokens.length;
					flatten(parseTree[index].children);
					const closingBracketIndex = tokens.length - 1;
					path.push([openingBracketIndex, closingBracketIndex]);
				}
			}
		}
		
		flatten(parseTree);
		return [tokens, path.sort((left, right) => left[0] - right[0])];
	};
	
	try {
		// If there is a way to pair all open brackets to close brackets and leave no orphans
		const output = flattenParseTree(parser.parse(text));
		const tokens = output[0];
		const path = output[1];
		return {tokens, path};
	} catch (error) {
		// If there is no such way
		const tokens = tokenizer.parse(text);
		const path = null;
		return {tokens, path};
	}
}