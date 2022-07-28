import * as convertor from "../../scripts/convertor.js";
import SSElement from "./SSElement.jsx";

import * as React from "react";
import {SSUserInterface} from "../UserInterfaces/SSEditor/index.jsx";

export default class SSKey extends SSElement {
	constructor (props) {
		super(props);
		this.state = {"elementValue": this.props.elementValue};
	}
	
	onInputOrChange (classInstance, dispatchFunction) {
		return function (event) {
			dispatchFunction({
				"type": "SAVE", 
				"targetType": classInstance.props.templateType, 
				"targetId": event.target.id, 
				"key": classInstance.props.elementKey, 
				"value": event.target.value
			});
			
			classInstance.setState({
				elementValue: event.target.value
			});
		}
	}
	
	onClick (classInstance, dispatchFunction) {
		return function (event) {
			dispatchFunction({
				"type": "OPEN", 
				"key": classInstance.state.elementValue
			});
		}
	}
	
	render () {
		let style = {
			color: "#000000", 
			minWidth: "72px", 
			maxWidth: "72px", 
			padding: "0px"
		};
		
		return (<SSUserInterface.Consumer>{dispatch => {
			if (this.props.dispatch) dispatch = this.props.dispatch;
			return (<input id={this.props.id} type="input" value={this.state.elementValue} maxLength="8" onInput={this.onInputOrChange(this, dispatch)} onChange={this.onInputOrChange(this, dispatch)} onClick={this.onClick(this, dispatch)} style={style}></input>);
		}}</SSUserInterface.Consumer>);
	}
}