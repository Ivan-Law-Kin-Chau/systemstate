import * as React from "react";
import * as ReactDOM from "react-dom";
import SSAssembly from "./classes/SSAssembly.js";
import SSItemSelected from "./classes/SSItemSelected.js";
import SSWindowSelected from "./classes/SSWindowSelected.jsx";

// import ReactAsyncDevTools from "react-async-devtools";

ReactDOM.render(<>
	{/*<span style={{
		zIndex: 256, 
		position: "absolute", 
		top: "0px", 
		right: "0px"
	}}><ReactAsyncDevTools/></span>*/}
	<div id="renderZone">Content will be rendered here</div>
</>, document.getElementById("app"));

window.assembly = new SSAssembly();
window.selected = new SSItemSelected();
window.renderFunction = async function () {
	ReactDOM.render(<SSWindowSelected/>, document.getElementById("renderZone"));
}

window.onload = renderFunction();