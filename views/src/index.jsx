import * as React from "react";
import * as ReactDOM from "react-dom";
import SSAssembly from "./classes/SSAssembly.js";
import SSSelected from "./classes/SSSelected.js";
import SSListener from "./classes/SSListener.js";
import SSWindow from "./classes/SSWindow.jsx";

ReactDOM.render(<div>
	<div id="renderZone">Content will be rendered here<br/></div><br/>
	
	Documentations: <button onClick={() => window.open("/resources/documentations.html", "_blank")}>(View)</button><br/>
	
	Editor Actions: <button onClick={() => window.assembly.syncWithServer().then(() => window.renderFunction())}>(Save)</button><br/>
</div>, document.body);

window.assembly = new SSAssembly();
window.selected = new SSSelected();
window.listener = new SSListener(window.assembly, window.selected);
window.renderFunction = async function () {
	ReactDOM.render(<SSWindow uuid={"fzYkA7sH"} isRoot/>, document.getElementById("renderZone"));
}

window.onload = renderFunction();