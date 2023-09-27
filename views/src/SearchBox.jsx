import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import * as ReactAsync from "react-async";

export default SearchBox = props => {
	const {data, error, isPending} = ReactAsync.useAsync({
		promiseFn: window.search, 
		searchTerm: props.searchTerm
	});
	
	if (isPending) return "Loading...";
	if (error) return "Something went wrong: " + error.message;
	if (data) return <pre>
		<div style={{
			position: "relative", 
			display: "inline-block"
		}}>{props.searchTerm}
			<span style={{
				top: "100%", 
				left: "0%", 
				position: "absolute", 
				zIndex: "1", 
				backgroundColor: "rgba(255, 255, 255, 0.85)", 
				border: "1px solid #000000"
			}}>{JSON.stringify(data, null, "\t")}</span>
		</div>
	</pre>;
}