import * as convertor from "../../scripts/convertor.js";
import SSElement from "./SSElement.jsx";

import * as React from "react";
import {SSUserInterface} from "../UserInterfaces/SSEditor/index.jsx";

export default class SSTextarea extends SSElement {
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
	
	render () {
		let style = {
			color: "#000000", 
			display: "inline-block", 
			position: "relative", 
			top: "-1px"
		};
		
		let dimensions = this.simulate(this.state.elementValue ? this.state.elementValue : "");
		style.width = dimensions.width;
		style.height = dimensions.height;
		
		return (<SSUserInterface.Consumer>{dispatch => {
			if (this.props.dispatch) dispatch = this.props.dispatch;
			return (<textarea id={this.props.id} type="text" value={this.state.elementValue} onInput={this.onInputOrChange(this, dispatch)} onChange={this.onInputOrChange(this, dispatch)} style={style}></textarea>);
		}}</SSUserInterface.Consumer>);
	}
}