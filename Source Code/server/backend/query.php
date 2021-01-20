<?php

class _query {
	function set_typed_array($type) {
		$this->type = $type;
		$array = func_get_args();
		unset($array[0]);
		$array = array_values($array);
		$outer = [];
		$schema = $GLOBALS["database"]->get_schema();
		if (array_key_exists($this->type, $schema)) {
			foreach ($array as $key => $value) {
				$outer[$schema[$this->type][$key]] = $value;
			}
		}
		foreach ($outer as $key => $value) {
			$this->$key = $value;
		}
	}
	
	function execute() {
		$outer = get_object_vars($this);
		$schema = ["uuid", "uuidNew", "parent", "parentNew", "start", "end", "direction", "name", "content"];
		foreach ($outer as $key => $value) {
			if (in_array($key, $schema)) {
				$value = implode("''", explode("'", $value));
			}
			$this->$key = $value;
		}
		extract(get_object_vars($this), EXTR_OVERWRITE);
		eval('$this->sql = "'.$this->sql.'";');
		return $GLOBALS["database"]->query($this);
	}
	
	function database_callback($success, $array = null) {
		if ($array) {
			extract($array, EXTR_OVERWRITE);
		}
		if ($this->get_queryType()) {
			foreach ($array as $row) {
				// SQLite3 does not natively support booleans
				// So here the value of $row["direction"] has to be converted back into a boolean if it exists
				if ($row["direction"] === "") {
					$row["direction"] = null;
				} else if ($row["direction"] === "1") {
					$row["direction"] = true;
				} else if ($row["direction"] === "0") {
					$row["direction"] = false;
				}
				eval($this->get_inner());
			}
		}
		foreach (get_defined_vars() as $key => $value) {
			$this->$key = $value;
		}
		$callback_function = $this->callback;
		return $callback_function((array)$this);
	}
	
	function get_queryType() {
		if (!(isset($this->queryType)) || $this->queryType == null) {
			return false;
		} else {
			return $this->queryType;
		}
	}
	
	function get_inner() {
		if (!(isset($this->inner)) || $this->inner == null) {
			return null;
		} else {
			return $this->inner;
		}
	}
}

?>