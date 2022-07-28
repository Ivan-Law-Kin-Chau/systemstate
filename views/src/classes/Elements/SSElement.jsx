import * as React from "react";

export default class SSElement extends React.Component {
	simulate (input) {
		var virtualElement = document.createElement("pre");
		virtualElement.style.display = "inline-block";
		virtualElement.style.visibility = "hidden";
		virtualElement.style.width = "auto";
		virtualElement.style.height = "auto";
		virtualElement.innerHTML = input;
		document.getElementsByTagName("body")[0].appendChild(virtualElement);
		
		if (input.split("\n")[input.split("\n").length - 1] == "") {
			var output = {
				"width": (virtualElement.getBoundingClientRect().width) + "px", 
				"height": (virtualElement.getBoundingClientRect().height + 20) + "px"
			};
		} else {
			var output = {
				"width": (virtualElement.getBoundingClientRect().width) + "px", 
				"height": (virtualElement.getBoundingClientRect().height + 1) + "px"
			};
		}
		
		virtualElement.outerHTML = "";
		virtualElement.remove();
		return output;
	}
}