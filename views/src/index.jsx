import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import {createEditor, Node} from "slate";
import {Slate, Editable, withReact} from "slate-react";

import PEG from "pegjs";

import processTokens from "./tokens.jsx";

const App = () => {
	const initialValue = [
		{
			type: "paragraph", 
			children: [{text: ""}]
		}
	]
	
	const [editor] = React.useState(() => withReact(createEditor()));
	
	const [tokens, setTokens] = React.useState([]);
	
	React.useEffect(() => {
		console.log(processTokens(tokens));
	}, [tokens]);
	
	const [tokenizer, setTokenizer] = React.useState(null);
	
	React.useEffect(() => {
		fetch(`/tokenizer.pegjs`)
			.then(response => response.text())
			.then(tokenizer => setTokenizer(PEG.generate(tokenizer)));
	}, []);
	
	if (tokenizer === null) return ``;
	
	const renderElement = ({attributes, children, element}) => {
		if (element.type === "meta") {
			return <div title={element.parseType} style={{
				border: "1px solid #000000"
			}} {...attributes}>{children}</div>;
		} else {
			return <p style={{
				margin: "0px"
			}} {...attributes}>{children}</p>;
		}
	};
	
	return <>
		<pre>
			<div>
				{JSON.stringify(editor.children, null, "\t")}
			</div>
		</pre>
		<Slate editor={editor} initialValue={initialValue} onChange={nodes => {
			// Serialize the nodes into plaintext
			const text = nodes.map(node => Node.string(node)).join("\n");
			
			// Handle the plaintext
			setTokens(tokenizer.parse(text));
		}}>
			<Editable tabIndex="-1" renderElement={renderElement} style={{
				border: "1px solid #000000", 
			}} onKeyDown={event => {
				if (event.keyCode === 9) {
					event.preventDefault();
					editor.insertText("\t");
				}
			}}/>
		</Slate>
		<pre>
			<div>
				{JSON.stringify(tokens, null, "\t")}
			</div>
		</pre>
	</>;
}

const root = ReactDOMClient.createRoot(document.getElementById("app"));
root.render(<App/>);