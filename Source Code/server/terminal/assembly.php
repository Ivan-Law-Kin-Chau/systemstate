<?php

class _assembly {
	function new_line() {
		return "\n";
	}
	
	function boolean_convert($input, $prefix = true) {
		if ($prefix == true) {
			if ($input === null) {
				return 'null';
			} else if ($input === true) {
				return 'true';
			} else if ($input === false) {
				return 'false';
			} else if ($input == 'null') {
				return null;
			} else if ($input == 'true') {
				return true;
			} else if ($input == 'false') {
				return false;
			}
		}
		if ($prefix == false) {
			if ($input === null) {
				return 'is null';
			} else if ($input === true) {
				return '= true';
			} else if ($input === false) {
				return '= false';
			} else if ($input == 'is null') {
				return null;
			} else if ($input == '= true') {
				return true;
			} else if ($input == '= false') {
				return false;
			}
		}
	}
	
	function query($sql, $queryType = false, $inner = null) {
		$query = new _query();
		$query->type = "query";
		$query->sql = $sql;
		$query->queryType = $queryType;
		$query->inner = $inner;
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		}; 
		return $query->execute();
	}
	
	function add_object($uuid) {
		$query = new _query();
		$query->set_typed_array("object", $uuid);
		$query->sql = 'INSERT INTO `$type` VALUES (\'$uuid\');';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		}; 
		return $query->execute();
	}
	
	function load_object($uuid) {
		$query = new _query();
		$query->set_typed_array("object", $uuid);
		$query->sql = 'SELECT * FROM `$type` WHERE uuid = \'$uuid\';';
		$query->queryType = true;
		$query->inner = '$output = $row["uuid"];';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $output;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		}; 
		return $query->execute();
	}
	
	function save_object($uuid, $uuidNew) {
		$query = new _query();
		$query->uuidNew = $uuidNew;
		$query->set_typed_array("object", $uuid);
		$query->sql = 'UPDATE `$type` SET uuid = \'$uuidNew\' WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuidNew;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		}; 
		return $query->execute();
	}
	
	function remove_object($uuid) {
		$query = new _query();
		$query->set_typed_array("object", $uuid);
		$query->sql = 'DELETE FROM `$type` WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		}; 
		return $query->execute();
	}
	
	function add_group($uuid, $parent) {
		$query = new _query();
		$query->set_typed_array("group", $uuid, $parent);
		$query->sql = 'INSERT INTO `$type` VALUES (\'$uuid\', \'$parent\');';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_parent = $parent;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function load_group($uuid, $parent) {
		$query = new _query();
		$query->set_typed_array("group", $uuid, $parent);
		$query->sql = 'SELECT * FROM `$type` WHERE uuid = \'$uuid\' AND parent = \'$parent\';';
		$query->queryType = true;
		$query->inner = '$output = $row["uuid"]; $parent = $row["parent"];';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $output;
			$json->_parent = $parent;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function save_group($uuid, $uuidNew, $parent, $parentNew) {
		$query = new _query();
		$query->uuidNew = $uuidNew;
		$query->parentNew = $parentNew;
		$query->set_typed_array("group", $uuid, $parent);
		$query->sql = 'UPDATE `$type` SET uuid = \'$uuidNew\', parent = \'$parentNew\' WHERE uuid = \'$uuid\' AND parent = \'$parent\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuidNew;
			$json->_parent = $parentNew;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function remove_group($uuid, $parent) {
		$query = new _query();
		$query->set_typed_array("group", $uuid, $parent);
		$query->sql = 'DELETE FROM `$type` WHERE uuid = \'$uuid\' AND parent = \'$parent\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function add_link($uuid, $start, $end, $direction = null) {
		$query = new _query();
		$query->set_typed_array("link", $uuid, $start, $end, $this->boolean_convert($direction, true));
		$query->sql = 'INSERT INTO `$type` VALUES (\'$uuid\', \'$start\', \'$end\', $direction);';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_start = $start;
			$json->_end = $end;
			$json->_direction = $direction;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function load_link($uuid) {
		$query = new _query();
		$query->set_typed_array("link", $uuid);
		$query->sql = 'SELECT * FROM `$type` WHERE uuid = \'$uuid\';';
		$query->queryType = true;
		$query->inner = '$output = $row["uuid"]; $start = $row["start"]; $end = $row["end"]; $direction = $row["direction"];';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $output;
			$json->_start = $start;
			$json->_end = $end;
			$json->_direction = $direction;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function save_link($uuid, $uuidNew, $start, $end, $direction = null) {
		$query = new _query();
		$query->uuidNew = $uuidNew;
		$query->set_typed_array("link", $uuid, $start, $end, $this->boolean_convert($direction, true));
		$query->sql = 'UPDATE `$type` SET uuid = \'$uuidNew\', start = \'$start\', end = \'$end\', direction = $direction WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuidNew;
			$json->_start = $start;
			$json->_end = $end;
			$json->_direction = $direction;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function remove_link($uuid) {
		$query = new _query();
		$query->set_typed_array("link", $uuid);
		$query->sql = 'DELETE FROM `$type` WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function add_property($uuid, $parent, $name, $content) {
		$query = new _query();
		$query->set_typed_array("property", $uuid, $parent, $name, $content);
		$query->sql = 'INSERT INTO `$type` VALUES (\'$uuid\', \'$parent\', \'$name\', \'$content\');';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuid;
			$json->_parent = $parent;
			$json->_name = $name;
			$json->_content = $content;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function load_property($uuid) {
		$query = new _query();
		$query->set_typed_array("property", $uuid);
		$query->sql = 'SELECT * FROM `$type` WHERE uuid = \'$uuid\';';
		$query->queryType = true;
		$query->inner = '$output = $row["uuid"]; $parent = $row["parent"]; $name = $row["name"]; $content = $row["content"];';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $output;
			$json->_parent = $parent;
			$json->_name = $name;
			$json->_content = $content;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function save_property($uuid, $uuidNew, $parent, $name, $content) {
		$query = new _query();
		$query->uuidNew = $uuidNew;
		$query->set_typed_array("property", $uuid, $parent, $name, $content);
		$query->sql = 'UPDATE `$type` SET uuid = \'$uuidNew\', parent = \'$parent\', name = \'$name\', content = \'$content\' WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $uuidNew;
			$json->_parent = $parent;
			$json->_name = $name;
			$json->_content = $content;
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function remove_property($uuid) {
		$query = new _query();
		$query->set_typed_array("property", $uuid);
		$query->sql = 'DELETE FROM `$type` WHERE uuid = \'$uuid\';';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_success = $success;
			$json->_type = $type;
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function search($property, $content, $type = "object", $descriptive = null) {
		$query = new _query();
		$query->type = $type;
		$query->queryType = true;
		if (isset($descriptive) == true) {
			if ($descriptive == true) {
				$query->sql = 'SELECT DISTINCT t1.parent, t2.content FROM `property` t1 JOIN `property` t2 ON t1.parent = t2.parent WHERE t1.content LIKE \'$content\' ORDER BY t1.parent, t2.name ASC;';
				$query->inner = 'if(!(isset($output) == true)) { $output = array(); $parent = ""; } if($parent != $row["parent"]) { $parent = $row["parent"]; $output[count($output)] = [$row["parent"], $row["content"]]; } else { $output[count($output)] = [$row["content"]]; }';
			} else {
				if ($type == "group") {
					$query->sql = 'SELECT uuid, parent FROM `$type` WHERE $property LIKE \'$content\';';
					$query->inner = 'if(!(isset($output) == true)) { $output = array(); } $output[count($output)] = []; foreach($row as $rowProperty => $rowContent) { $output[count($output) - 1][$rowProperty] = $rowContent; }';
				} else {
					$query->sql = 'SELECT uuid FROM `$type` WHERE $property LIKE \'$content\';';
					$query->inner = 'if(!(isset($output) == true)) { $output = array(); } $output[count($output)] = []; foreach($row as $rowProperty => $rowContent) { $output[count($output) - 1][$rowProperty] = $rowContent; }';
				}
			}
		} else {
			if ($type == "group") {
				$query->sql = 'SELECT uuid, parent FROM `$type` WHERE $property LIKE \'$content\';';
				$query->inner = 'if(!(isset($output) == true)) { $output = array(); } $output[count($output)] = []; foreach($row as $rowProperty => $rowContent) { $output[count($output) - 1][$rowProperty] = $rowContent; }';
			} else {
				$query->sql = 'SELECT uuid FROM `$type` WHERE $property LIKE \'$content\';';
				$query->inner = 'if(!(isset($output) == true)) { $output = array(); } $output[count($output)] = []; foreach($row as $rowProperty => $rowContent) { $output[count($output) - 1][$rowProperty] = $rowContent; }';
			}
		}
		$query->property = $property;
		$query->content = $content;
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_uuid = $output;
			$json->_success = $success;
			$json->_type = "search";
			$json->_sql = $sql;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
	
	function restore($filename) {
		if (json_decode($this->clear(true))->_success == true) {
			$query = new _query();
			$query->type = "import";
			$query->filename = $filename;
			$query->sql = '.read $filename.sql';
			$query->callback = function($outer) {
				extract($outer, EXTR_OVERWRITE);
				$json = new stdClass();
				$json->_filename = $filename.".sql";
				$json->_encrypted = false;
				$json->_success = $success;
				$json->_type = $type;
				$jsonOutput = json_encode($json);
				return $jsonOutput;
			};
			return $query->execute();
		}
	}
	
	function backup($filename) {
		$query = new _query();
		$query->type = "export";
		$query->filename = $filename;
		$query->sql = '.output $filename.sql\r\n.dump\r\n.output stdout';
		$query->callback = function($outer) {
			extract($outer, EXTR_OVERWRITE);
			$json = new stdClass();
			$json->_filename = $filename.".sql";
			$json->_encrypted = false;
			$json->_success = $success;
			$json->_type = $type;
			$jsonOutput = json_encode($json);
			return $jsonOutput;
		};
		return $query->execute();
	}
}

?>