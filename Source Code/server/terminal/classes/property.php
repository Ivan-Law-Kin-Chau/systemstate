<?php

class _property extends _element {
	function __construct() {
		$this->set_defaults(["_uuid", "_parent", "_name", "_content"]);
	}
		
	function add($uuid = null, $parent = null, $name = null, $content = null) {
		extract($this->assign(["uuid" => &$uuid, "parent" => &$parent, "name" => &$name, "content" => &$content], true), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->add_property($uuid, $parent, $name, $content)));
	}
	
	function load($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->load_property($uuid)));
	}
	
	function save($uuid = null, $uuidNew = null, $parent = null, $name = null, $content = null) {
		extract($this->assign(["uuid" => &$uuid, "uuidNew" => &$uuidNew, "parent" => &$parent, "name" => &$name, "content" => &$content]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->save_property($uuid, $uuidNew, $parent, $name, $content)));
	}
	
	function remove($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->remove_property($uuid)), true);
	}
}

?>