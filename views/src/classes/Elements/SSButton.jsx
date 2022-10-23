import * as convertor from "../../scripts/convertor.js";
import SSElement from "../SSElement.js";

import * as React from "react";
import {SSEditorContext} from "../UserInterfaces/SSEditor/index.jsx";

export default class SSButton extends React.Component {
	constructor (props) {
		super(props);
		this.state = {"elementValue": convertor.convertHTMLToBoolean(this.props.elementValue)};
	}
	
	onClick (classInstance, dispatchFunction) {
		return function (event) {
			var newValue;
			if (classInstance.state.elementValue === null) {
				newValue = true;
			} else if (classInstance.state.elementValue === true) {
				newValue = false;
			} else if (classInstance.state.elementValue === false) {
				newValue = null;
			}
			
			dispatchFunction({
				"type": "SAVE", 
				"targetTable": classInstance.props.table, 
				"targetId": event.target.id, 
				"attribute": classInstance.props.elementAttribute, 
				"value": newValue
			});
			
			classInstance.setState({
				elementValue: newValue
			});
		}
	}
	
	render () {
		let style = {
			color: "#000000", 
			height: "22px", 
			position: "relative", 
			top: "-1px"
		};
		
		return (<SSEditorContext.Consumer>{dispatch => {
			if (this.props.dispatch) dispatch = this.props.dispatch;
			return (<button id={this.props.id} onClick={this.onClick(this, dispatch)} style={style}>{convertor.convertBooleanToDirection(convertor.convertHTMLToBoolean(this.state.elementValue))}</button>);
		}}</SSEditorContext.Consumer>);
	}
}