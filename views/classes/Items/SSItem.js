import * as classes from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";

import {h, Component, render} from "../../../libraries/preact.js";
import htm from "../../../libraries/htm.js";

const html = htm.bind(h);

export default class SSComponent extends Component {
	generateHTMFromTemplate (identityString, selectedObject, item, templateThis, templateArray) {
		var getRed = function (action = "_element") {
			if (selectedObject.array === null) return false;
			if (item._type !== selectedObject.array.split("_")[0]) return false;
			if (identityString !== selectedObject.identityString) return false;
			if (action !== selectedObject.action) return false;
			return true;
		}
		
		var itemAddRemove = function (identityString, item) {
			var outputArray = [];
			if (item._add === true) outputArray = [...outputArray, " ", html`<${classes["SSAdd"]} templateType=${item._type} templateThis=${templateThis} id="${identityString}" red=${getRed("_add")}/>`];
			if (item._remove === true) outputArray = [...outputArray, " ", html`<${classes["SSRemove"]} templateType=${item._type} templateThis=${templateThis} id="${identityString}" red=${getRed("_remove")}/>`];
			return outputArray;
		}
		
		for (let i = 0; i < templateArray.length; i++) {
			if (Array.isArray(templateArray[i])) {
				if (templateArray[i].length === 2) { // Arrays with 2 elements means a regular SSComponent
					templateArray[i][2] = templateThis;
				} else if (templateArray[i].length === 0) { // Empty array means "insert the itemAddRemove here"
					templateArray.splice(i, 1); // Put the splice here so that the splice is done even if the length of itemAddRemove is 0
					const addRemoves = itemAddRemove(identityString, item);
					for (let j = 0; j < addRemoves.length; j++) {
						templateArray.splice(i, 0, addRemoves[j]);
						i++;
					}
				} else if (templateArray[i][2] === templateThis && templateThis !== null) { // Some arrays are displayed as "this" instead
					templateArray[i][1] = "this";
					const addRemoves = itemAddRemove(identityString, item);
					for (let j = 0; j < addRemoves.length; j++) {
						templateArray.splice(i + 1, 0, addRemoves[j]);
						i++;
					}
					break;
				}
			}
		}
		
		var processArray = [];
		
		for (let j = 0; j < templateArray.length; j++) {
			if (Array.isArray(templateArray[j])) { // The arrays with 2 elements from above
				const elementName = convertor.convertCamelCaseToSS(templateArray[j][1]);
				if (templateArray[j][0] === true) {
					processArray.push(html`<${classes[elementName]} templateType=${item._type} templateThis=${templateThis} id=${identityString} elementKey=${"_" + templateArray[j][2]} elementValue=${item["_" + templateArray[j][2]]} red=${getRed()}/>`);
				} else if (templateArray[j][0] === false) {
					processArray.push(html`<${classes[elementName]} templateType=${item._type} templateThis=${templateThis} id=${identityString} red=${getRed()}/>`);
				}
			} else if (typeof templateArray[j] == "object") { // The empty arrays from above
				processArray.push(templateArray[j]);
			} else if (typeof templateArray[j] == "string") { // The array elements that are just strings
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