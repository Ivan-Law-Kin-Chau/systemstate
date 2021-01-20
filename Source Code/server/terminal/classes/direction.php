<?php

class _direction {
	private $_value = [false, false];
	
	function __construct($value = "%%%%%%%%") {
		$this->set_value($value);
	}
	
	function set_value($value) {
		if ($value === true) {
			$this->_value = [true, true];
		} else if ($value === false) {
			$this->_value = [true, false];
		} else if ($value === null) {
			$this->_value = [false, true];
		} else if ($value === "%%%%%%%%") {
			$this->_value = [false, false];
		} else {
			$GLOBALS["logger"]->catch("There is an illegal direction with the value \"".$value."\". ");
		}
	}
	
	function get_value() {
		if ($this->_value == [true, true]) {
			return true;
		} else if ($this->_value == [true, false]) {
			return false;
		} else if ($this->_value == [false, true]) {
			return null;
		} else if ($this->_value == [false, false]) {
			$GLOBALS["logger"]->catch("There is an undefined direction with the value \"%%%%%%%%\". ");
		}
	}
}

?>