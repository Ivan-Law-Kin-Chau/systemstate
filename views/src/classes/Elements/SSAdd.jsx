import * as convertor from "../../scripts/convertor.js";
import SSElement from "../SSElement.js";

import * as React from "react";
import {SSEditorContext} from "../UserInterfaces/SSEditor/index.jsx";

export default class SSAdd extends React.Component {
	constructor (props) {
		super(props);
		this.state = {"red": false};
	}
	
	onClick (classInstance, dispatchFunction) {
		return function (event) {
			dispatchFunction({
				"type": "SELECT", 
				"array": classInstance.props.templateType + "_" + classInstance.props.templateThis, 
				"identityString": classInstance.props.id, 
				"action": "_add"
			});
		}
	}
	
	render () {
		let style = {};
		if (this.props.red === false) {
			style.color = "#000000";
		} else if (this.props.red === true) {
			style.color = "#FF0000";
		}
		
		return (<SSEditorContext.Consumer>{dispatch => {
			if (this.props.dispatch) dispatch = this.props.dispatch;
			return (<span id={this.props.id} onClick={this.onClick(this, dispatch)} style={style}>#add</span>);
		}}</SSEditorContext.Consumer>);
	}
}