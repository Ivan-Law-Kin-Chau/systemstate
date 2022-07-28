import * as elements from "../Elements/All.js";
import * as convertor from "../../scripts/convertor.js";

import * as React from "react";

export default class SSItem extends React.Component {
	generateJSXFromTemplate (identityString, selectedObject, item, templateThis, templateArray) {
		var getRed = function (action = "_element") {
			if (selectedObject.array === null) return false;
			if (item._type !== selectedObject.array.split("_")[0]) return false;
			if (identityString !== selectedObject.identityString) return false;
			if (action !== selectedObject.action) return false;
			return true;
		}
		
		var itemAddRemove = function (identityString, item) {
			var outputArray = [];
			
			if (item._add === true) {
				const Add = elements["SSAdd"];
				outputArray = [...outputArray, " ", (<Add templateType={item._type} templateThis={templateThis} id={identityString} red={getRed("_add")}/>)];
			}
			
			if (item._remove === true) {
				const Remove = elements["SSRemove"];
				outputArray = [...outputArray, " ", (<Remove templateType={item._type} templateThis={templateThis} id={identityString} red={getRed("_remove")}/>)];
			}
			
			return outputArray;
		}
		
		for (let i = 0; i < templateArray.length; i++) {
			if (Array.isArray(templateArray[i])) {
				// Arrays with 2 elements means a regular SSElement
				if (templateArray[i].length === 2) {
					templateArray[i][2] = templateThis;
				// Empty array means "insert the itemAddRemove here"
				} else if (templateArray[i].length === 0) {
					// Put the splice here so that the splice is done even if the length of itemAddRemove is 0
					templateArray.splice(i, 1);
					const addRemoves = itemAddRemove(identityString, item);
					for (let j = 0; j < addRemoves.length; j++) {
						templateArray.splice(i, 0, addRemoves[j]);
						i++;
					}
				// Some arrays are displayed as "this" instead
				} else if (templateArray[i][2] === templateThis && templateThis !== null) {
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
			// The arrays with 2 elements from above
			if (Array.isArray(templateArray[j])) {
				const elementName = convertor.convertCamelCaseToSS(templateArray[j][1]);
				if (templateArray[j][0] === true) {
					const Element = elements[elementName];
					processArray.push(<Element key={identityString + "_" + j} templateType={item._type} templateThis={templateThis} id={identityString} elementKey={"_" + templateArray[j][2]} elementValue={item["_" + templateArray[j][2]]} red={getRed()}/>);
				} else if (templateArray[j][0] === false) {
					const Element = elements[elementName];
					processArray.push(<Element key={identityString + "_" + j} templateType={item._type} templateThis={templateThis} id={identityString} red={getRed()}/>);
				}
			// The empty arrays from above
			} else if (typeof templateArray[j] == "object") {
				processArray.push(templateArray[j]);
			// The array elements that are just strings
			} else if (typeof templateArray[j] == "string") {
				if (templateArray[j] === "\n") {
					processArray.push(<br key={identityString + "_" + j}/>);
				} else {
					processArray.push(templateArray[j]);
				}
			}
		}
		
		return processArray;
	}
}