import {isValidKey, isValidDirection, isValidSingleLineString, isValidMultiLineString} from "../scripts/validator.js";
import SSObject from "./SSObject.js";

export default class SSProperty extends SSObject {
	validate () {
		if (this.state._type !== "property") return false;
		if (!(isValidKey(this.state._uuid))) return false;
		if (!(isValidKey(this.state._parent))) return false;
		if (!(isValidSingleLineString(this.state._name))) return false;
		if (!(isValidMultiLineString(this.state._content))) return false;
		return true;
	}
}