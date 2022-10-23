import * as convertor from "../../scripts/convertor.js";
import SSElement from "../SSElement.js";

import * as React from "react";
import {SSEditorContext} from "../UserInterfaces/SSEditor/index.jsx";

export default class SSInput extends React.Component {
	constructor (props) {
		super(props);
		this.state = {"elementValue": this.props.elementValue};
	}
	
	onInputOrChange (classInstance, dispatchFunction) {
		return function (event) {
			dispatchFunction({
				"type": "SAVE", 
				"targetTable": classInstance.props.table, 
				"targetId": event.target.id, 
				"attribute": classInstance.props.elementAttribute, 
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
			position: "relative", 
			top: "-1px"
		};
		
		let dimensions = SSElement.simulate(this.state.elementValue ? this.state.elementValue : "");
		style.width = dimensions.width;
		style.height = dimensions.height;
		
		return (<SSEditorContext.Consumer>{dispatch => {
			if (this.props.dispatch) dispatch = this.props.dispatch;
			return (<input id={this.props.id} type="text" value={this.state.elementValue} onInput={this.onInputOrChange(this, dispatch)} onChange={this.onInputOrChange(this, dispatch)} style={style}></input>);
		}}</SSEditorContext.Consumer>);
	}
}