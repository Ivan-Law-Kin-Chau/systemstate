<?php

class _group extends _element {
	function __construct() {
		$this->set_defaults(["_uuid", "_parent"]);
	}
		
	function add($uuid = null, $parent = null) {
		extract($this->assign(["uuid" => &$uuid, "parent" => &$parent], true), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->add_group($uuid, $parent)));
	}
	
	function load($uuid = null, $parent = null) {
		extract($this->assign(["uuid" => &$uuid, "parent" => &$parent]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->load_group($uuid, $parent)));
	}
	
	function save($uuid = null, $uuidNew = null, $parent = null, $parentNew = null) {
		extract($this->assign(["uuid" => &$uuid, "uuidNew" => &$uuidNew, "parent" => &$parent, "parentNew" => &$parentNew]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->save_group($uuid, $uuidNew, $parent, $parentNew)));
	}
	
	function remove($uuid = null, $parent = null) {
		extract($this->assign(["uuid" => &$uuid, "parent" => &$parent]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->remove_group($uuid, $parent)), true);
	}
}

?>