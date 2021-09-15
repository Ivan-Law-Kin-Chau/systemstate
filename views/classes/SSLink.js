import {isValidKey, isValidDirection, isValidSingleLineString, isValidMultiLineString} from "../scripts/validator.js";
import SSObject from "./SSObject.js";

export default class SSLink extends SSObject {
	validate () {
		if (this.state._type !== "link") return false;
		if (!(isValidKey(this.state._uuid))) return false;
		if (!(isValidKey(this.state._start))) return false;
		if (!(isValidKey(this.state._end))) return false;
		if (!(isValidDirection(this.state._direction))) return false;
		return true;
	}
}