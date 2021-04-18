class Button extends SSElement {
	callback0 () {
		if (this.state.value == null) {
			this.state.value = true;
		} else if (this.state.value == true) {
			this.state.value = false;
		} else if (this.state.value == false) {
			this.state.value = null;
		}
		reduxStore.dispatch({
			"type": "EDITOR_UPDATE", 
			"array": this.state.array, 
			"attribute": this.state.attribute, 
			"updated": this.state.value, 
			"index": this.state.index
		});
		this.load();
	}
	
	render () {
		const ElementType = "button";
		const ElementId = this.preload(ElementType);
		
		return (
			<ElementType id={ElementId} onClick={this.callback0} style={this.state.style ? this.state.style : undefined}>
				{direction_convert(this.state.item[this.state.attribute])}
			</ElementType>
		);
	}
}