import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import {Transforms} from "slate";

import * as ReactAsync from "react-async";

export const ModeContext = React.createContext();

const InternalSearchBox = props => {
	const [previousData, setPreviousData] = React.useState("Loading... ");
	
	const {data, error, isPending} = ReactAsync.useAsync({
		promiseFn: window.search, 
		searchTerm: props.searchTerm, 
		watch: props.searchTerm
	});
	
	if (isPending) return previousData;
	
	if (error) return "Something went wrong: " + error.message;
	
	if (data) {
		const newData = JSON.stringify(data, null, "\t");
		
		if (previousData !== newData) {
			setPreviousData(newData);
		}
		
		return newData;
	}
}

export const SearchBox = props => {
	const inputRef = React.useRef(null);
	React.useEffect(() => {
		inputRef.current.focus();
	}, []);
	
	const {editor, mode, setMode} = React.useContext(ModeContext);
	
	const [searchTerm, setSearchTerm] = React.useState("");
	
	return <pre style={{
		margin: "0px", 
		display: "inline"
	}}>
		<span style={{
			display: "none"
		}} {...props.attributes}>{props.children}</span>
		
		<div style={{
			position: "relative", 
			display: "inline-block"
		}}>
			<input ref={inputRef} type="text" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} onKeyDown={event => {
				if (event.key === "Control") {
					setMode("typing");
					Transforms.removeNodes(editor, {at: [], match: (node, path) => node.isSearchBox === true});
				}
			}}/>
			
			<span style={{
				top: "100%", 
				left: "0%", 
				position: "absolute", 
				zIndex: "1", 
				backgroundColor: "rgba(255, 255, 255, 0.85)", 
				border: "1px solid #000000"
			}}><InternalSearchBox searchTerm={searchTerm}/></span>
		</div>
	</pre>;
}