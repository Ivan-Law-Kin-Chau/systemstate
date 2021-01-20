<?php

class _varchar {
	private $_value = null;
	
	function __construct($value = null) {
		$this->set_value($value);	
	}
	
	function set_value($value) {
		$this->_value = implode("/'", explode("'", $value));
	}
	
	function get_value() {
		return implode("'", explode("/'", $this->_value));
	}
}

?>