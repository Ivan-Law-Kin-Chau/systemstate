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

window.onload = renderFunction();