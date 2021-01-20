<?php

class _element {
	private $_default = [];
	private $_types = [
		"_uuid" => "key", 
		"_uuidNew" => "key", 
		"_parent" => "key", 
		"_parentNew" => "key", 
		"_start" => "key", 
		"_end" => "key", 
		"_direction" => "direction", 
		"_name" => "varchar", 
		"_content" => "varchar"
	];
	
	function set_defaults($array) {
		foreach ($this->_types as $key => $value) {
			if (array_key_exists($key, $array) && $key != "uuidNew" && $key != "parentNew") {
				if ($this->_types[$key] == "key") {
					eval('$this->_default[$key] = (new '.$this->_types[$key].'(null));');
					eval('$this->'.$key.' = (new '.$this->_types[$key].'(null))');
				} else {
					eval('$this->_default[$key] = new '.$this->_types[$key].'()');
					eval('$this->'.$key.' = new '.$this->_types[$key].'()');
				}
			}
		}
	}
	
	function assign($array, $add = false) {
		foreach ($array as $key => $value) {
			$type = $this->_types["_".$key];
			$validator = (new _validation($type));
			if (call_user_func([$validator, "check_".$type], $value) == true) {
				if ($type == "key" && $value == "********") {
					$value = $validator->value;
				}
				$array[$key] = $value;
			} else {
				if ($add) {
					eval('$key = (new _'.$type.'())->get_value();');
				} else {
					eval('$key = $this->_'.$key.'->get_value();');
				}
			}
		}
		return $array;
	}
	
	function is_successful($input, $remove = false) {
		if ($input) {
			if ($input->_success === true) {
				if ($remove) {
					foreach ($input as $key => $value) {
						if (array_key_exists($key, $this->_default)) {
							$this[$key] = $this->_default[$key];
						}
					}
				} else {
					foreach ($input as $key => $value) {
						if (array_key_exists($key, $this->_default)) {
							$type = $this->_types["_".$key];
							eval('$this[$key] = new _'.$type.'($input[$key]);');
						}
					}
				}
				return $input;
			}
		}
	}
}

?>