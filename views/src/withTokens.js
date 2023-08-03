import {Editor, Node, Path, Text, Transforms} from "slate";

export default withTokens = (editor, tokenizer) => {
	editor.isInline = element => {
		if (element.isToken === true) return true;
		return false;
	}
	
	const {normalizeNode} = editor;
	editor.normalizeNode = entry => {
		const [node, path] = entry;
		
		if (Text.isText(Node.get(editor, path)) && Node.parent(editor, path).type === "paragraph") {
			Editor.withoutNormalizing(editor, () => {
				const tokens = tokenizer.parse(Node.get(editor, path).text);
				let incrementablePath = path;
				
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
					
					incrementablePath = Path.next(incrementablePath);
				}
			});
		}
		
		if (node.isToken === true && JSON.stringify(node.nominalChildren) !== JSON.stringify(node.children)) {
			Editor.withoutNormalizing(editor, () => {
				Transforms.unwrapNodes(editor, {
					at: Path.parent(path), 
					match: node => node.isToken === true, 
					split: true
				});
			});
		}
		
		normalizeNode(entry);
	};
	
	return editor;
}