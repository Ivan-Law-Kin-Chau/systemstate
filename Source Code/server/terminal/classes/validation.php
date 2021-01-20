<?php

class _validation {
	function __construct($type) {
		$this->_type = $type;
	}
	
	function check_key($value = "%%%%%%%%") {
		$return = true;
		$key = (new _key($value));
		if ($key->get_type() == "undefined" || $key->get_type() == "illegal") {
			$return = false;
		}
		$this->value = $key->get_value();
		return $return;
	}
	
	function check_varchar($value = null) {
		$return = true;
		if ((new _varchar($value))->get_value() == null) {
			$return = false;
		}
		return $return;
	}
	
	function check_direction($value = "%%%%%%%%") {
		$return = true;
		{
			try {
				(new _direction($value))->get_value();
			} catch (Throwable $error) {
				$return = false;
			}
		}
		return $return;
	}
}

?>