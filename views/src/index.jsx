import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import {createEditor, Editor, Node, Path, Text, Element, Transforms} from "slate";
import {Slate, Editable, withReact} from "slate-react";

import PEG from "pegjs";

import processTokens from "./tokens.jsx";

import Controlled from "./controlled.jsx";

const App = () => {
	const initialValue = [
		{
			type: "paragraph", 
			children: [{text: ""}]
		}
	]
	
	const [editor] = React.useState(() => withReact(createEditor()));
	
	const [editorChildren, setEditorChildren] = React.useState(editor.children);
	
	const [tokenizer, setTokenizer] = React.useState(null);
	
	React.useEffect(() => {
		fetch(`/tokenizer.pegjs`)
			.then(response => response.text())
			.then(tokenizer => setTokenizer(PEG.generate(tokenizer)));
	}, []);
	
	if (tokenizer === null) return ``;
	
	const renderElement = props => {
		return <Controlled {...props}/>;
	};
	
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
	
	window.editor = editor;
	
	return <>
		<pre>
			<div>
				{JSON.stringify(editorChildren, null, "\t")}
			</div>
		</pre>
		<Slate editor={editor} initialValue={initialValue} onChange={() => setEditorChildren(editor.children)}>
			<Editable tabIndex="-1" renderElement={renderElement} style={{
				border: "1px solid #000000", 
			}} onKeyDown={event => {
				if (event.keyCode === 9) {
					event.preventDefault();
					editor.insertText("\t");
				}
			}}/>
		</Slate>
	</>;
}

const root = ReactDOMClient.createRoot(document.getElementById("app"));
root.render(<App/>);