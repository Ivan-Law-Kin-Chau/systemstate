class Key extends SSElement {
	callback0 (event) {
		reduxStore.dispatch({
			"type": "EDITOR_UPDATE", 
			"array": this.state.array, 
			"attribute": this.state.attribute, 
			"updated": event.target.value, 
			"index": this.state.index
		});
		this.load(false, event.target.value);
	}
	
	callback1 () {
		visitKey(this.state.value);
	}
	
	render () {
		const ElementType = "input";
		const ElementId = this.preload(ElementType, {
			"minWidth": "72px", 
			"maxWidth": "72px", 
			"padding": "0px"
		});
		
		return (
			<ElementType id={ElementId} type="input" value={this.state.value} maxLength="8" onChange={this.callback0} onClick={this.callback1} style={this.state.style ? this.state.style : undefined}></ElementType>
		);
	}
}