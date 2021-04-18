class SSElement extends React.Component {
	constructor (props) {
		super();
		this.state = JSON.parse(JSON.stringify(props));
		this.state.style = {};
		this.load(true);
	}
	
	componentDidUpdate (prevProps) {
		if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
			for (let prop in this.props) {
				this.state[prop] = this.props[prop];
			}
			this.setState({});
		}
	}
	
	preload (ElementType, style = {}) {
		if (this.callback0) this.callback0 = this.callback0.bind(this);
		if (this.callback1) this.callback1 = this.callback1.bind(this);
		
		const ElementId = this.state.array + "_" + this.state.index + this.state.attribute;
		
		if (ElementType === "span") {
			const colorTarget = reduxStore.getState().selector.colorTarget;
			if (colorTarget !== null) {
				if (colorTarget === ElementId) {
					style.color = "#FF0000";
				} else {
					style.color = "#000000";
				}
			}
		}
		
		this.state.style = JSON.parse(JSON.stringify(style));
		return ElementId;
	}
	
	load (isFirstLoad = false, newValue = null) {
		console.log(this.state);
		if (isFirstLoad === true) {
			this.state.item = reduxStore.getState().editor[this.state.array][this.state.index];
			this.state.value = this.state.item[this.state.attribute];
		} else {
			this.state.item[this.state.attribute] = newValue;
			this.state.value = this.state.item[this.state.attribute];
		}
		console.log(this.state);
	}
}