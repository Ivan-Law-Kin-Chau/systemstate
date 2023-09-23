import {Editor, Point} from "slate";

export default class Tracked {
	constructor (type, dependencies = {}) {
		this.type = type;
		this.dependencies = dependencies;
		this.children = [];
		this.created = false;
	}
	
	addListenerToTraverser (text, traverser) {
		for (let dependency of Object.values(this.dependencies)) {
			if (dependency.type !== "point") continue;
			
			dependency.index = null;
			if (dependency.pointRef === undefined) continue;
			
			traverser.addListener("characters", "start", function (getIndexes, getPoint, getNodeEntry) {
				const currentPoint = getPoint();
				const trackedPoint = dependency.pointRef.current;
				
				if (Point.isPoint(currentPoint) && 
					Point.isPoint(trackedPoint) && 
					Point.equals(currentPoint, trackedPoint)) {
						const indexes = getIndexes();
						
						if (dependency.character === text[indexes.characters]) {
							dependency.index = indexes.tokens;
						}
				}
			});
		}
	}
	
	handleTraverseResults (trackedTokens) {
		if (Object.values(this.dependencies).map(dependency => dependency.index).includes(null)) {
			// This calls the removeChild method of the parent class instance
			this.remove();
		} else {
			for (let dependency of Object.values(this.dependencies)) {
				if (dependency.type === "point") {
					trackedTokens.push({index: dependency.index});
				}
			}
		}
	}
	
	addChild (newTracked) {
		this.children.push(newTracked);
		this.children[this.children.length - 1].setRemove(() => this.removeChild(this.children.length - 1));
	}
	
	removeChild (index) {
		this.children.splice(index, 1);
		
		for (let key in this.dependencies) {
			if (this.dependencies[key].type === "children" && this.dependencies[key].index === index) {
				this.dependencies[key].index = null;
			}
		}
	}
	
	remove () {
		throw "Remove function not set";
	}
	
	setRemove (remove) {
		this.remove = remove;
	}
	
	recursivelyCall (callback) {
		this.children.forEach(child => child.recursivelyCall(callback));
		callback(this);
	}
	
	addPointRefs (editor) {
		if (this.created === false) {
			this.created = true;
			
			for (let dependency of Object.values(this.dependencies)) {
				if (dependency.type === "point") {
					dependency.pointRef = Editor.pointRef(editor, dependency.point);
					delete dependency.point;
				}
			}
		}
	}
}