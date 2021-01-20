isSameObject = function(input1, input2) {
	if (JSON.stringify(input1) === JSON.stringify(input2)) {
		return true;
	} else {
		return false;
	}
}

mouseNodeInterface = function(nodeId, mouseNodeAction) {
	if (mouseNodeAction == "click") {
		if (originallyOpened != document.getElementById(nodeId).innerHTML) {
			load(document.getElementById(nodeId).innerHTML);
		}
	}
	if (mouseNodeAction == "enter") {
		mouseOnNode = true;
		document.activeElement.blur();
		load(document.getElementById(nodeId).innerHTML, false);
		if (document.getElementById(nodeId).style.borderColor == "rgb(153, 153, 153)") {
			document.getElementById(nodeId).style.border = "3px solid #FFFF00";
		}
		lines = document.getElementsByTagName("line");
		for (i = 0; i < lines.length; i++) {
			source = lines[i].id.split("_")[0];
			target = lines[i].id.split("_")[1];
			for (nodeItem in graphEngine.nodeList) {
				if (isSameObject(nodeId, graphEngine.nodeList[nodeItem]._nodeLabel) == true) {
					nodeKey = graphEngine.nodeList[nodeItem]._key;
					if (graphEngine.nodeList[nodeItem]._screenRepresentation.style.borderColor == "rgb(255, 0, 0)") {
						color = "#FF0000";
					} else {
						color = "#FFFF00";
					}
				}
			}
			if (isSameObject(nodeKey, graphEngine.nodeList[source]._key) == true || isSameObject(nodeKey, graphEngine.nodeList[target]._key) == true) {
				if (lines[i].style.stroke == "rgb(153, 153, 153)") {
					lines[i].style.stroke = color;
				}
			}
		}
	}
	if (mouseNodeAction == "leave") {
		mouseOnNode = false;
		load(originallyOpened, false);
		if (document.getElementById(nodeId).style.borderColor == "rgb(255, 255, 0)") {
			document.getElementById(nodeId).style.border = "3px solid #999999";
		}
		lines = document.getElementsByTagName("line");
		for (i = 0; i < lines.length; i++) {
			source = lines[i].id.split("_")[0];
			target = lines[i].id.split("_")[1];
			for (nodeItem in graphEngine.nodeList) {
				if (isSameObject(nodeId, graphEngine.nodeList[nodeItem]._nodeLabel) == true) {
					nodeKey = graphEngine.nodeList[nodeItem]._key;
				}
			}
			if (isSameObject(nodeKey, graphEngine.nodeList[source]._key) == true || isSameObject(nodeKey, graphEngine.nodeList[target]._key) == true) {
				if (lines[i].style.stroke == "rgb(255, 255, 0)" || lines[i].style.stroke == "rgb(255, 0, 0)") {
					lines[i].style.stroke = "#999999";
				}
			}
		}
	}
}

node = function(json) {
	nodeObject = {};
	if (json._type == "object") {
		return null;
	} else {
		if (json._type == "group") {
			nodeObject._key = {
				"_uuid": json._uuid, 
				"_parent": json._parent
			};
		} else {
			nodeObject._key = {
				"_uuid": json._uuid
			};
		}
	}
	nodeObject._relationships = [nodeObject._key];
	beingSearched = {};
	if (json._dependencies) {
		for (dependencyType in json._dependencies) {
			for (dependencyValue in json._dependencies[dependencyType]) {
				if (dependencyType == "group_uuid") {
					beingSearched = {
						"_uuid": json._uuid, 
						"_parent": json._dependencies[dependencyType][dependencyValue]
					};
				} else if (dependencyType == "group_parent") {
					beingSearched = {
						"_uuid": json._dependencies[dependencyType][dependencyValue], 
						"_parent": json._uuid
					};
				} else {
					beingSearched = {
						"_uuid": json._dependencies[dependencyType][dependencyValue]
					};
				}
				if (beingSearched) {
					nodeObject._relationships[nodeObject._relationships.length] = beingSearched;
				}
			}
		}
	}
	iterate(function(array, i, variable) {
		if (editor[array][i][variable]) {
			if (array.split(" ")[0] == "group_uuid") {
				beingSearched = {
					"_uuid": editor[array][i][variable], 
					"_parent": editor[array][i]["_parent"]
				};
			} else if (array.split(" ")[0] == "group_parent") {
				beingSearched = {
					"_uuid": editor[array][i]["_uuid"], 
					"_parent": editor[array][i][variable]
				};
			} else {
				beingSearched = {
					"_uuid": editor[array][i][variable]
				};
			}
			nodeObject._relationships[nodeObject._relationships.length] = beingSearched;
		}
	}, "editor[array][i]", ["_uuid", "_parent", "_start", "_end"]);
	return nodeObject;
}

graph = function(editor) {
	if (typeof graphObject != "undefined") {
		graphEngine.svg.selectAll("*").remove();
		document.getElementById("canvas").firstChild.outerHTML = "";
	}
	deleteCompleted = false;
	while (deleteCompleted == false) {
		deleteCompleted = true;
		deleteItemList = document.getElementsByTagName("div");
		for (i = 0; i < deleteItemList.length; i++) {
			if (deleteItemList[i].id) {
				if (deleteItemList[i].id.split("_")[0] == "nodeLabel") {
					deleteItemList[i].outerHTML = "";
					deleteCompleted = false;
				}
			}
		}
	}
	selector();
	graphObject = {};
	editorItemList = [];
	iterate(function(array, i) {
		editorItemList[editorItemList.length] = editor[array][i];
	}, "editor[array]", null);
	graphObject.nodeList = [];
	partialNodeList = [];
	for (editorItem in editorItemList) {
		nodeToBeAdded = node(editorItemList[editorItem]);
		if (nodeToBeAdded != null) {
			graphObject.nodeList[graphObject.nodeList.length] = nodeToBeAdded;
			for (partialNode in nodeToBeAdded._relationships) {
				partialNodeList[partialNodeList.length] = {
					"_key": nodeToBeAdded._relationships[partialNode]
				};
			}
		}
	}
	for (partialNode in partialNodeList) {
		alreadyExist = false;
		for (i = 0; i < graphObject.nodeList.length; i++) {
			if (isSameObject(partialNodeList[partialNode]._key, graphObject.nodeList[i]._key) == true) {
				alreadyExist = true;
			}
		}
		if (alreadyExist == false) {
			graphObject.nodeList[graphObject.nodeList.length] = partialNodeList[partialNode];
		}
	}
	linkList = [];
	for (nodeListItem in graphObject.nodeList) {
		for (dependencyListItem in graphObject.nodeList[nodeListItem]._relationships) {
			for (nodeListItemChecked in graphObject.nodeList) {
				if (isSameObject(graphObject.nodeList[nodeListItem]._relationships[dependencyListItem], graphObject.nodeList[nodeListItemChecked]._key) == true) {
					linkList[linkList.length] = {
						"source": Number(nodeListItem), 
						"target": Number(nodeListItemChecked)
					};
				}
			}
		}
	}
	graphObject.d3Interface = {};
	graphObject.d3Interface._size = {
		"width": document.getElementById("canvas").getBoundingClientRect().width - 16, 
		"height": document.getElementById("canvas").getBoundingClientRect().height - 16
	};
	graphObject.svg = d3.select("#canvas").append("svg");
	graphObject.svg.attr("width", graphObject.d3Interface._size.width);
	graphObject.svg.attr("height", graphObject.d3Interface._size.height);
	graphObject.d3Interface._force = d3.layout.force();
	graphObject.d3Interface._force.size([graphObject.d3Interface._size.width, graphObject.d3Interface._size.height]);
	graphObject.d3Interface._force.nodes(graphObject.nodeList);
	graphObject.d3Interface._force.links(linkList);
	graphObject.d3Interface._force.linkDistance(180);
	graphObject.d3Interface._force.linkStrength(0.03);
	graphObject.d3Interface._force.charge(-300);
	graphObject.d3Interface._link = graphObject.svg.selectAll(".link").data(linkList).enter().append("line");
	graphObject.d3Interface._link.attr("style", "stroke: #999999; stroke-width: 3px;");
	graphObject.d3Interface._node = graphObject.svg.selectAll(".node").data(graphObject.nodeList).enter().append("circle");
	graphObject.d3Interface._node.attr("style", "fill: #FFFFFF;");
	graphObject.d3Interface._force.on("end", function() {
		if (document.activeElement.id) {
			activeElement = document.activeElement.id;
			selectionStart = document.activeElement.selectionStart;
			selectionEnd = document.activeElement.selectionEnd;
			document.activeElement.blur();
		}
		delimitEditor();
		graphObject.d3Interface._link.attr("id", function(d3Output) {
			return d3Output.source.index + "_" + d3Output.target.index;
		});
		graphObject.d3Interface._link.attr("x1", function(d3Output) {
			return d3Output.source.x;
		});
		graphObject.d3Interface._link.attr("y1", function(d3Output) {
			return d3Output.source.y;
		});
		graphObject.d3Interface._link.attr("x2", function(d3Output) {
			return d3Output.target.x;
		});
		graphObject.d3Interface._link.attr("y2", function(d3Output) {
			return d3Output.target.y;
		});
		graphObject.d3Interface._node.attr("r", 6);
		graphObject.d3Interface._node.attr("cx", function(d3Output) {
			return d3Output.x;
		});
		graphObject.d3Interface._node.attr("cy", function(d3Output) {
			return d3Output.y;
		});
		graphObject.d3Interface._node.attr("eval", function(d3Output) {
			document.getElementById("editor").innerHTML += implement({
				"js.class": "nodeLabel", 
				"js.variables": {
					"x": d3Output.x, 
					"y": d3Output.y, 
					"innerHTML": JSON.stringify(d3Output._key), 
					"randomString": Math.random().toString()
				}
			});
			return "";
		});
		if (mouseOnNode == true) {
			setStatusMessage("Previewing Editor");
		}
		if (mouseOnNode == false) {
			setStatusMessage();
		}
		currentlyOpenedCheckerList = document.getElementsByTagName("div");
		for (i = 0; i < currentlyOpenedCheckerList.length; i++) {
			if (currentlyOpenedCheckerList[i].id) {
				if (currentlyOpenedCheckerList[i].id.split("_")[0] == "nodeLabel") {
					try {
						innerJSON = JSON.parse(currentlyOpenedCheckerList[i].innerHTML);
					} catch (error) {
						currentlyOpenedCheckerList[i].outerHTML = "";
					} finally {
						for (nodeItem in graphObject.nodeList) {
							if (isSameObject(innerJSON, graphObject.nodeList[nodeItem]._key) == true) {
								graphObject.nodeList[nodeItem]._nodeLabel = currentlyOpenedCheckerList[i].id;
								graphObject.nodeList[nodeItem]._screenRepresentation = currentlyOpenedCheckerList[i];
							}
						}
						if (typeof innerJSON._parent != "undefined" && innerJSON._uuid == currentlyOpened) {
							currentlyOpenedCheckerList[i].innerHTML = innerJSON._parent;
						} else if (typeof innerJSON._parent != "undefined" && innerJSON._parent == currentlyOpened) {
							currentlyOpenedCheckerList[i].innerHTML = innerJSON._uuid;
						} else {
							currentlyOpenedCheckerList[i].innerHTML = innerJSON._uuid;
						}
						if (currentlyOpenedCheckerList[i].innerHTML == currentlyOpened) {
							currentlyOpenedCheckerList[i].classList.add("nodeLabel");
							currentlyOpenedCheckerList[i].style.border = "3px solid #FF0000";
							currentlyOpenedCheckerList[i].style.zIndex = "2";
						} else {
							currentlyOpenedCheckerList[i].classList.add("nodeLabel");
							currentlyOpenedCheckerList[i].style.border = "3px solid #999999";
							currentlyOpenedCheckerList[i].style.zIndex = "1";
						}
					}
				}
			}
		}
		unvalidatedNodeLabelsCount = 1;
		while (unvalidatedNodeLabelsCount > 0) {
			unvalidatedNodeLabelsCount = 0;
			for (i = 0; i < currentlyOpenedCheckerList.length; i++) {
				if (currentlyOpenedCheckerList[i].id) {
					if (currentlyOpenedCheckerList[i].id.split("_")[0] == "nodeLabel") {
						validated = false;
						try {
							JSON.parse(currentlyOpenedCheckerList[i].innerHTML);
						} catch (error) {
							validated = true;
						} finally {
							if (validated == false) {
								currentlyOpenedCheckerList[i].outerHTML = "";
								unvalidatedNodeLabelsCount ++;
							}
						}
					}
				}
			}
		}
		window.selection.recolor();
		if (typeof activeElement != "undefined") {
			document.getElementById(activeElement).focus();
			document.activeElement.selectionStart = selectionStart;
			document.activeElement.selectionEnd = selectionEnd;
		}
	});
	graphObject.d3Interface._force.start();
	return graphObject;
}