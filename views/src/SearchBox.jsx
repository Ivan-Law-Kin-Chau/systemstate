import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import {Transforms} from "slate";

import * as ReactAsync from "react-async";

export const ModeContext = React.createContext();

const InternalSearchBox = props => {
	const [previousData, setPreviousData] = React.useState([]);
	
	const {data, error, isPending} = ReactAsync.useAsync({
		promiseFn: window.search, 
		searchTerm: props.searchTerm, 
		watch: props.searchTerm
	});
	
	let newPreviousData = previousData;
	let hasChanged = false;
	
	// Make previousData identical to data
	if (!isPending && !error && data) {
		if (newPreviousData.length > data.length) {
			newPreviousData.splice(data.length, newPreviousData.length - data.length);
			hasChanged = true;
		}
		
		for (let index = 0; index < data.length; index++) {
			if (typeof data[index] === "string") break;
			const stringified = JSON.stringify(data[index], null, "\t");
			if (newPreviousData[index] !== stringified) {
				newPreviousData[index] = stringified;
				if (props.activeSearchResultIndex === index) props.setActiveSearchResultIndex(-1);
				hasChanged = true;
			}
		}
	}
	
	React.useEffect(() => {
		if (hasChanged === true) {
			setPreviousData(data);
			props.setMaximumSearchResultIndex(data.length);
		}
	}, [data]);
	
	const activeRef = React.useRef(null);
	React.useEffect(() => {
		if (props.activeSearchResultIndex !== -1) {
			activeRef.current.scrollIntoView({inline: "nearest", block: "nearest"});
		}
	}, [props.activeSearchResultIndex]);
	
	if (error) return "Something went wrong: " + error.message;
	
	return <>{newPreviousData.map((datum, index) => props.activeSearchResultIndex === index ? <div key={index} ref={activeRef} style={{
		border: "3px solid #000000"
	}}>{datum}</div> : <div key={index} style={{
		border: "3px solid #FFFFFF"
	}}>{datum}</div>)}</>;
}

export const SearchBox = props => {
	const {editor, mode, setMode} = React.useContext(ModeContext);
	
	const [searchTerm, setSearchTerm] = React.useState("");
	const [activeSearchResultIndex, setActiveSearchResultIndex] = React.useState(-1);
	const [maximumSearchResultIndex, setMaximumSearchResultIndex] = React.useState(-1);
	
	const inputRef = React.useRef(null);
	React.useEffect(() => {
		if (activeSearchResultIndex === -1) {
			inputRef.current.scrollIntoView({inline: "nearest", block: "nearest"});
			inputRef.current.focus();
		}
	}, [activeSearchResultIndex]);
	
	return <pre style={{
		margin: "0px", 
		display: "inline"
	}} onFocus={() => inputRef.current.focus()} onClick={() => inputRef.current.focus()}>
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
				} else if (event.key === "ArrowUp" && activeSearchResultIndex > -1) {
					event.preventDefault();
					setActiveSearchResultIndex(activeSearchResultIndex - 1);
				} else if (event.key === "ArrowDown" && activeSearchResultIndex < maximumSearchResultIndex - 1) {
					event.preventDefault();
					setActiveSearchResultIndex(activeSearchResultIndex + 1);
				}
			}} style={{
				outline: "none", 
				position: "relative", 
				zIndex: activeSearchResultIndex === -1 ? "2" : "auto", 
				border: activeSearchResultIndex === -1 ? "3px solid #000000" : "3px solid #FFFFFF"
			}}/>
			
			<span style={{
				top: "100%", 
				left: "0%", 
				position: "absolute", 
				zIndex: "1", 
				backgroundColor: "#FFFFFF", 
				border: "1px solid #000000"
			}}><InternalSearchBox searchTerm={searchTerm} activeSearchResultIndex={activeSearchResultIndex} setActiveSearchResultIndex={setActiveSearchResultIndex} setMaximumSearchResultIndex={setMaximumSearchResultIndex}/></span>
		</div>
	</pre>;
}