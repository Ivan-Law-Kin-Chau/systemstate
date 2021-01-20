<?php

class _key {
	private $_value = "%%%%%%%%";
	private $_type = "undefined";
	
	function __construct($value = "********") {
		if ($value === null) {
			$this->set_value("%%%%%%%%");
		} else {
			if ($this->set_value($value) != true) {
				$GLOBALS["logger"]->catch("There is an ".$this->_type." key with the value \"".$value."\". ");
			}
		}		
	}
	
	function set_value($value) {
		if ($value == "%%%%%%%%") {
			$this->_value = $value;
			$this->_type = "undefined";
			return false;
		}
		if ($value == "********") {
			$this->_value = json_decode($GLOBALS["terminal"]->generate_uuid())->_uuid;
			$this->_type = "standard";
			return true;
		} else {
			$this->_value = $value;
			for ($i = 0; $i < count(str_split($value)); $i++) {
				if (strpos("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", $value[$i]) === false) {
					$specialCharacterDetected = true;
				}			
			}
			if (!(isset($specialCharacterDetected))) {
				$this->_type = "standard";
				return true;
			} else {
				$this->_type = "illegal";
				return false;
			}
		}			
	}
	
	function get_value() {
		return $this->_value;
	}
	
	function get_type() {
		return $this->_type;
	}
}

?>