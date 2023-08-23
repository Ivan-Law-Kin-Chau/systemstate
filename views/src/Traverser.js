export default class Traverser {
	constructor () {
		this.types = [];
		this.streams = {};
		this.listeners = {};
	}
	
	hasStream (type) {
		if (typeof type !== "string") {
			throw "Type mismatch";
		}
		
		const inTypes = this.types.includes(type);
		const inStreams = Array.isArray(this.streams[type]);
		
		if (inTypes !== inStreams) {
			throw "Type mismatch";
		}
		
		return inTypes && inStreams;
	}
	
	setStream (type, stream, toString = null) {
		if (type === "characters") {
			if (typeof type !== "string" || typeof stream !== "string" || toString !== null) {
				throw "Type mismatch";
			}
			
			this.streams.characters = [];
			
			for (let characterInStream = 0; characterInStream < stream.length; characterInStream++) {
				this.streams.characters.push({
					character: stream.charAt(characterInStream), 
					indexes: {
						characters: characterInStream
					}, 
					starts: new Set(["characters"]), 
					ends: new Set(["characters"])
				});
			}
		} else {
			if (!this.hasStream("characters")) {
				throw "Characters not provided";
			}
			
			if (typeof type !== "string" || !Array.isArray(stream) || typeof toString !== "function") {
				throw "Type mismatch";
			}
			
			this.streams[type] = stream;
			let characterInStream = 0;
			
			for (let index = 0; index < stream.length; index++) {
				const string = toString(stream[index]);
				
				for (let characterInString = 0; characterInString < string.length; characterInString++) {
					const characterObject = this.streams.characters[characterInStream];
					
					if (characterObject === undefined) {
						throw "Length mismatch";
					}
					
					if (characterObject.character !== string[characterInString]) {
						throw "Character mismatch";
					}
					
					if (characterInString === 0 || characterInString === string.length - 1) {
						if (characterInString === 0) {
							characterObject.starts.add(type);
						}
						
						if (characterInString === string.length - 1) {
							characterObject.ends.add(type);
						}
					} else {
						characterObject.starts.delete(type);
						characterObject.ends.delete(type);
					}
					
					characterObject.indexes[type] = index;
					characterInStream++;
				}
			}
			
			if (characterInStream !== this.streams.characters.length) {
				throw "Length mismatch";
			}
		}
		
		this.types.push(type);
	}
	
	hasListener (type, event) {
		if (typeof type !== "string" || typeof event !== "string") {
			throw "Type mismatch";
		}
		
		if (event !== "start" && event !== "end") {
			throw "Event mismatch";
		}
		
		if (this.listeners[type] === undefined) {
			return false;
		}
		
		return typeof this.listeners[type][event] === "function";
	}
	
	setListener (type, event, listener) {
		if (!this.hasStream(type)) {
			throw "Type not provided";
		}
		
		if (typeof type !== "string" || typeof event !== "string" || typeof listener !== "function") {
			throw "Type mismatch";
		}
		
		if (event !== "start" && event !== "end") {
			throw "Event mismatch";
		}
		
		if (this.listeners[type] === undefined) {
			this.listeners[type] = {};
		}
		
		this.listeners[type][event] = listener;
	}
	
	traverse () {
		if (!this.hasStream("characters")) {
			throw "Characters not provided";
		}
		
		var currentIndexes = null;
		var characterIndexes = null;
		var getIndexes = () => structuredClone(characterIndexes);
		
		if (this.hasStream("nodes")) {
			var currentPoint = null;
			var getPoint = () => structuredClone(currentPoint);
			
			var currentNodeEntry = null;
			var getNodeEntry = () => structuredClone(currentNodeEntry);
		} else {
			var getPoint = () => {
				throw "Nodes not provided";
			};
			
			var getNodeEntry = () => {
				throw "Nodes not provided";
			};
		}
		
		let state = {};
		
		for (let characterInStream = 0; characterInStream < this.streams.characters.length; characterInStream++) {
			characterIndexes = this.streams.characters[characterInStream].indexes;
			
			if (this.hasStream("nodes")) {
				for (let typeIndex = 0; typeIndex < this.types.length; typeIndex++) {
					const type = this.types[typeIndex];
					
					if (currentIndexes === null) {
						currentPoint = {path: [0, 0], offset: 0};
						currentNodeEntry = [this.streams.nodes[characterIndexes.nodes], currentPoint.path];
					} else if (currentIndexes[type] !== characterIndexes[type]) {
						if (type === "characters") {
							currentPoint.offset += 1;
						} else if (type === "nodes") {
							currentPoint.path = [0, currentPoint.path[1] + 1];
							currentPoint.offset = 0;
							currentNodeEntry = [this.streams.nodes[characterIndexes.nodes], currentPoint.path];
						}
					}
				}
			}
			
			const characterObject = this.streams.characters[characterInStream];
			
			characterObject.starts.forEach(type => {
				if (this.hasListener(type, "start")) {
					this.listeners[type].start(state, getIndexes, getPoint, getNodeEntry);
				}
			});
			
			characterObject.ends.forEach(type => {
				if (this.hasListener(type, "end")) {
					currentPoint.offset += 1;
					this.listeners[type].end(state, getIndexes, getPoint, getNodeEntry);
					currentPoint.offset -= 1;
				}
			});
			
			currentIndexes = characterIndexes;
		}
		
		return state;
	}
}