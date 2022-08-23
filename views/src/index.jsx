import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

import SSAssembly from "./classes/SSAssembly.js";
import SSWindowSelected from "./classes/SSWindowSelected.jsx";

const root = ReactDOMClient.createRoot(document.getElementById("app"));

window.assembly = new SSAssembly();
window.renderFunction = async function () {
	root.render(<SSWindowSelected/>);
}

window.onload = () => {
	window.onkeyup = event => {
		if (event.keyCode === 16) window.shiftPressed = false;
	}
	
	window.onkeydown = event => {
		if (event.keyCode === 16) window.shiftPressed = true;
	}
	
	window.shiftPressed = false;
	window.renderFunction();
}