export function iteratorFactory () {
	iteratorObject = {};
	iteratorObject.state = -1;
	iteratorObject.iterate = () => {
		iteratorObject.state++;
		return iteratorObject.state;
	}
	
	return iteratorObject;
}