import * as classes from "./Elements/All.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSComponent extends Component {
	generateHTMFromTemplate (props, templateArray) {
		var information = {};
		
		// "uuid" refers to the UUID of #this
		["uuid", "array", "index"].forEach(function (item) {
			if (typeof props[item] === "undefined") {
				information[item] = null;
			} else {
				information[item] = props[item];
			}
		});
		
		var templateType = information.array.split("_")[0];
		var templateThis = information.array.split("_")[1];
		
		if (templateType === "group") {
			if (templateThis === "uuid") {
				templateThis = "parent";
			} else if (templateThis === "parent") {
				templateThis = "uuid";
			}
		}
		
		var itemAddRemove = function (item, array, index) {
			var output = "";
			if (item._add === true) output += html` <${SSAdd} id="${array + "_" + index}_add" red="0"/>`;
			if (item._remove === true) output += html` <${SSRemove} id="${array + "_" + index}_remove" red="0"/>`;
			return output;
		}
		
		for (let i = 0; i < templateArray.length; i++) {
			if (Array.isArray(templateArray[i])) {
				if (templateArray[i].length === 0) {
					templateArray[i] = itemAddRemove(this.state, information.index, information.array);
				} else if (templateArray[i].length === 2) {
					templateArray[i][2] = templateThis;
				} else if (templateArray[i][2] === templateThis) {
					templateArray[i][1] = "this";
					templateArray.splice(i + 1, 0, itemAddRemove(this.state, information.index, information.array));
					break;
				}
			}
		}
		
		var processArray = [];
		
		for (let j = 0; j < templateArray.length; j++) {
			if (Array.isArray(templateArray[j])) {
				const elementName = "SS" + templateArray[j][1][0].toUpperCase() + templateArray[j][1].slice(1);
				if (templateArray[j][0] === true) {
					processArray.push(html`<${classes[elementName]} id="${information.array + "_" + information.index}_this" value=${this.state["_" + templateArray[j][2]]} red="0"/>`);
				} else if (templateArray[j][0] === false) {
					processArray.push(html`<${classes[elementName]} id="${information.array + "_" + information.index}_this" red="0"/>`);
				}
			}
			
			if (typeof templateArray[j] == "string") {
				if (templateArray[j] === "\n") {
					processArray.push(html`<br/>`);
				} else {
					processArray.push(templateArray[j]);
				}
			}
		}
		
		return processArray;
	}
}