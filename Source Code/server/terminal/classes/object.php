<?php

class _object extends _element {
	function __construct() {
		$this->set_defaults(["_uuid"]);
	}
	
	function add($uuid = null) {
		extract($this->assign(["uuid" => &$uuid], true), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->add_object($uuid)));
	}
	
	function load($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->load_object($uuid)));
	}
	
	function save($uuid = null, $uuidNew = null) {
		extract($this->assign(["uuid" => &$uuid, "uuidNew" => &$uuidNew]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->save_object($uuid, $uuidNew)));
	}
	
	function remove($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->remove_object($uuid)), true);
	}
}

?>