class Add extends SSElement {
	callback0 () {
		reduxStore.dispatch({
			"type": "SELECTOR_SELECT", 
			"cache": reduxStore.getState().editor, 
			"selection": {
				"array": this.state.array, 
				"index": this.state.index, 
				"action": "add", 
				"attribute": this.state.attribute
			}
		});
	}
	
	render () {
		const ElementType = "span";
		const ElementId = this.preload(ElementType);
		
		return (
			<ElementType id={ElementId} onClick={this.callback0} style={this.state.style ? this.state.style : undefined}>#add</ElementType>
		);
	}
}