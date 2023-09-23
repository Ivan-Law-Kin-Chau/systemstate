import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

export default Controlled = props => {
	return <span style={{
		color: props.leaf.isTracked === true ? "#0000FF" : (
			props.leaf.type === "errorCharacter" ? "#AA0000" : "#000000"
		)
	}} {...props.attributes}>{props.children}</span>;
}