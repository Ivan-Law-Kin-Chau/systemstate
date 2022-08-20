import * as React from "react";

export default class WindowSpan extends React.Component {
	constructor (props) {
		super(props);
	}
	
	render () {
		return (<span style={{
			border: "1px solid #EEEEEE", 
			display: "inline-block", 
			verticalAlign: "top", 
			position: "relative", 
			top: "-1px"
		}}>
			<div style={{
				borderBottom: "1px solid #EEEEEE", 
				width: "100%", 
				height: "20px"
			}}/>
			
			<span style={{
				verticalAlign: "top", 
				position: "relative", 
				top: "1px"
			}}>{this.props.children}</span>
		</span>);
	}
}