import * as classes from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSComponent extends Component {
	generateHTMFromTemplate (identityString, selectedObject, item, templateThis, templateArray) {
		var getRed = function (action = "_element") {
			if (item._type !== selectedObject.array) return false;
			if (identityString !== selectedObject.identityString) return false;
			if (action !== selectedObject.action) return false;
			return true;
		}
		
		var itemAddRemove = function (identityString, item) {
			var output = "";
			if (item._add === true) output += html` <${SSAdd} type=${item._type} id="${identityString}_add" red=${getRed("_add")}/>`;
			if (item._remove === true) output += html` <${SSRemove} type=${item._type} id="${identityString}_remove" red=${getRed("_remove")}/>`;
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
				const elementName = convertor.convertCamelCaseToSS(templateArray[j][1]);
				if (templateArray[j][0] === true) {
					processArray.push(html`<${classes[elementName]} type=${item._type} id=${identityString} elementKey=${"_" + templateArray[j][2]} elementValue=${item["_" + templateArray[j][2]]} red=${getRed()}/>`);
				} else if (templateArray[j][0] === false) {
					processArray.push(html`<${classes[elementName]} type=${item._type} id=${identityString} red=${getRed()}/>`);
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