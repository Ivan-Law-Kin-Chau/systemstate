import * as elements from "../Elements/All.js";

import * as React from "react";

export default class SSItem extends React.Component {
	getRed (renderState, action = "_element") {
		if (renderState.selectedObject.array === null) return false;
		if (renderState.item._type !== renderState.selectedObject.array.split("_")[0]) return false;
		if (renderState.identityString !== renderState.selectedObject.identityString) return false;
		if (action !== renderState.selectedObject.action) return false;
		return true;
	}
	
	itemAddRemove (renderState) {
		const SSAdd = elements["SSAdd"];
		const SSRemove = elements["SSRemove"];
		return (<>
			{renderState.item._add === true ? <>
				{"\u00a0"}<SSAdd templateType={renderState.item._type} templateThis={renderState.templateThis} id={renderState.identityString} red={this.getRed(renderState, "_add")}/>
			</> : ""}
			
			{renderState.item._remove === true ? <>
				{"\u00a0"}<SSRemove templateType={renderState.item._type} templateThis={renderState.templateThis} id={renderState.identityString} red={this.getRed(renderState, "_remove")}/>
			</> : ""}
		</>);
	}
}