import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

export default Controlled = props => {
	return <span style={{
		// border: "1px solid #EEEEEE", 
		backgroundColor: props.leaf.isTracked === true ? "#CCCCFF" : "initial"
	}} {...props.attributes}>{props.children}</span>;
}