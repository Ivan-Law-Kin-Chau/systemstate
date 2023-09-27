import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import SSAssembly from "./classes/SSAssembly.js";

import {createEditor, Editor, Node, Transforms} from "slate";
import {Slate, Editable, withReact} from "slate-react";
import withTokens from "./withTokens.js";

import {ModeContext, SearchBox} from "./SearchBox.jsx";
import Controlled from "./Controlled.jsx";

const App = () => {
	const [editor] = React.useState(() => withTokens(withReact(createEditor())));
	window.editor = editor;
	
	const [editorChildren, setEditorChildren] = React.useState(editor.children);
	const [mode, setMode] = React.useState("typing");
	
	const initialValue = [{type: "paragraph", children: [{text: ""}]}];
	
	const renderLeaf = props => {
		if (props.leaf.isSearchBox === true) {
			return <SearchBox {...props}/>;
		} else {
			return <Controlled {...props}/>;
		}
	};
	
	return <ModeContext.Provider value={{editor, mode, setMode}}>
		<pre>
			<div>
				{JSON.stringify(editorChildren, null, "\t")}
			</div>
		</pre>
		<Slate editor={editor} initialValue={initialValue} onChange={() => setEditorChildren(editor.children)}>
			<Editable tabIndex="-1" renderLeaf={renderLeaf} readOnly={mode === "searching"} style={{
				border: "1px solid #000000"
			}} onKeyDown={event => {
				if (event.keyCode === 9) {
					event.preventDefault();
					editor.insertText("\t");
				} else if (event.keyCode === 13) {
					event.preventDefault();
					editor.insertText("\n");
				} else if (event.key === "Control") {
					setMode("searching");
					
					// The text cannot be empty, or the search box would be removed by Slate's default normalizeNode function
					Transforms.insertNodes(editor, {text: "SEARCH_BOX", isSearchBox: true});
				}
			}}/>
		</Slate>
	</ModeContext.Provider>;
};

const root = ReactDOMClient.createRoot(document.getElementById("app"));
root.render(<App/>);

window.assembly = new SSAssembly();

window.search = async function (props = {}) {
	const searchTerm = props.searchTerm || "";
	const relationshipsToSearch = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "link_direction", "property_uuid", "property_parent", "property_name", "property_content"];
	let searchResults = [];

	for (const relationship of relationshipsToSearch) {
		const table = relationship.split("_")[0];
		const headAttribute = relationship.split("_")[1];
		const relationshipResults = (await window.assembly.sender.send("search", `("${headAttribute}", "${searchTerm}", "${table}", true)`))._output;
		searchResults = [...searchResults, ...relationshipResults.map(relationshipResult => ({
			identity: relationshipResult, 
			relationship
		}))];
	}
	
	for (const searchResultIndex in searchResults) {
		const table = searchResults[searchResultIndex].relationship.split("_")[0];
		const identity = searchResults[searchResultIndex].identity;
		searchResults[searchResultIndex] = await window.assembly.getState(table, identity);
	}
	
	// Remove duplicate values from searchResults
	for (let smallerIndex = 0; smallerIndex < searchResults.length; smallerIndex++) {
		for (let largerIndex = smallerIndex + 1; largerIndex < searchResults.length; largerIndex++) {
			if (searchResults[smallerIndex][0] === searchResults[largerIndex][0] && 
				searchResults[smallerIndex][1] === searchResults[largerIndex][1]) {
					searchResults.splice(largerIndex, 1);
					largerIndex--;
				}
		}
	}
	
	return searchResults.map(searchResult => window.assembly.state[searchResult[0]][searchResult[1]]);
}