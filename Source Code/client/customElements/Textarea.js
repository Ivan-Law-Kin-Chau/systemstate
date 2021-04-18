class Textarea extends SSElement {
	callback0 (event) {
		reduxStore.dispatch({
			"type": "EDITOR_UPDATE", 
			"array": this.state.array, 
			"attribute": this.state.attribute, 
			"updated": event.target.value, 
			"index": this.state.index
		});
		this.load(false, event.target.value);
		this.setState({
			"style": {
				"width": simulate(this.state.value).width, 
				"height": simulate(this.state.value).height
			}
		});
	}
	
	render () {
		const ElementType = "textarea";
		const ElementId = this.preload(ElementType, {
			"display": "inline-block", 
			"position": "relative", 
			"top": "-2px", 
			"width": simulate(this.state.value).width, 
			"height": simulate(this.state.value).height
		});
		
		return (
			<ElementType id={ElementId} type="text" value={this.state.value} onChange={this.callback0} style={this.state.style ? this.state.style : undefined}></ElementType>
		);
	}
}