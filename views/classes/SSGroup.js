import {isValidKey, isValidDirection, isValidSingleLineString, isValidMultiLineString} from "../scripts/validator.js";
import SSObject from "./SSObject.js";

export default class SSGroup extends SSObject {
	validate () {
		if (this.state._type !== "group") return false;
		if (!(isValidKey(this.state._uuid))) return false;
		if (!(isValidKey(this.state._parent))) return false;
		return true;
	}
}