import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import {createEditor, Editor} from "slate";
import {Slate, Editable, withReact} from "slate-react";
import withTokens from "./withTokens.js";

import Controlled from "./controlled.jsx";

export default Main = props => {
	const [editor] = React.useState(() => withTokens(withReact(createEditor()), props.tokenizer));
	window.editor = editor;
	
	const [editorChildren, setEditorChildren] = React.useState(editor.children);
	
	const initialValue = [{type: "paragraph", children: [{text: ""}]}];
	
	const renderLeaf = props => <Controlled {...props}/>;
	
	return <>
		<pre>
			<div>
				{JSON.stringify(editorChildren, null, "\t")}
			</div>
		</pre>
		<Slate editor={editor} initialValue={initialValue} onChange={() => setEditorChildren(editor.children)}>
			<Editable tabIndex="-1" renderLeaf={renderLeaf} style={{
				border: "1px solid #000000", 
			}} onKeyDown={event => {
				if (event.keyCode === 9) {
					event.preventDefault();
					editor.insertText("\t");
				} else if (event.keyCode === 13) {
					event.preventDefault();
					editor.insertText("\n");
				}
			}}/>
		</Slate>
	</>;
}