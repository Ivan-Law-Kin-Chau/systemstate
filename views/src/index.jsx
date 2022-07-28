import * as React from "react";
import * as ReactDOM from "react-dom";
import SSAssembly from "./classes/SSAssembly.js";
import SSSelected from "./classes/SSSelected.js";
import SSListener from "./classes/SSListener.js";
import SSOpener from "./classes/SSOpener.js";

ReactDOM.render(<div>
	<div id="renderZone">Content will be rendered here<br/></div><br/>
	
	Documentations: <span className="white" onClick={() => window.open("/resources/documentations.html", "_blank")}>(View)</span><br/>
	
	Editor Actions: <span className="white" onClick={() => window.assembly.syncWithServer().then(() => window.renderFunction())}>(Save)</span><br/>
</div>, document.body);

window.assembly = new SSAssembly();
window.selected = new SSSelected();
window.listener = new SSListener(window.assembly, window.selected);
window.opener = new SSOpener(window.assembly, window.selected, window.listener);
window.renderFunction = async function () {
	const content = await window.opener.openUuid("fzYkA7sH");
	ReactDOM.render(<div>{content}</div>, document.getElementById("renderZone"));
	
	// (new (await window.opener.getClass("SSAliase"))("fzYkA7sH", window.assembly)).add();
	// (new (await window.opener.getClass("SSAliase"))("fzYkA7sH", window.assembly)).remove();
}

window.onload = renderFunction();