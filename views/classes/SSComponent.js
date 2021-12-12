import * as classes from "./Elements/All.js";

import {h, Component, render} from "../../libraries/preact.js";
import htm from "../../libraries/htm.js";

const html = htm.bind(h);

export default class SSComponent extends Component {
	generateHTMFromTemplate (identityString, item, templateThis, templateArray) {
		var itemAddRemove = function (identityString, item) {
			var output = "";
			if (item._add === true) output += html` <${SSAdd} id="${identityString}_add" red="0"/>`;
			if (item._remove === true) output += html` <${SSRemove} id="${identityString}_remove" red="0"/>`;
			return output;
		}
		
		for (let i = 0; i < templateArray.length; i++) {
			if (Array.isArray(templateArray[i])) {
				if (templateArray[i].length === 0) { // Empty array means "insert the itemAddRemove here"
					templateArray[i] = itemAddRemove(identityString, item);
				} else if (templateArray[i].length === 2) { // Array with 2 elements means a regular SSComponent
					templateArray[i][2] = templateThis;
				} else if (templateArray[i][2] === templateThis && templateThis !== null) { // Some arrays are displayed as "this" instead
					templateArray[i][1] = "this";
					templateArray.splice(i + 1, 0, itemAddRemove(identityString, item));
					break;
				}
			}
		}
		
		var processArray = [];
		
		for (let j = 0; j < templateArray.length; j++) {
			if (Array.isArray(templateArray[j])) {
				const elementName = "SS" + templateArray[j][1][0].toUpperCase() + templateArray[j][1].slice(1);
				if (templateArray[j][0] === true) {
					processArray.push(html`<${classes[elementName]} id="${identityString}_this" value=${item["_" + templateArray[j][2]]} red="0"/>`);
				} else if (templateArray[j][0] === false) {
					processArray.push(html`<${classes[elementName]} id="${identityString}_this" red="0"/>`);
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