import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

export default Controlled = props => {
	return <span style={{
		border: props.type === "paragraph" ? "initial" : "1px solid #000000"
	}} {...props.attributes}>{props.children}</span>;
}