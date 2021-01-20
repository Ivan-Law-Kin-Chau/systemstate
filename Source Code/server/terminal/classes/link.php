<?php

class _link extends _element {
	function __construct() {
		$this->set_defaults(["_uuid", "_start", "_end", "_direction"]);
	}
	
	function add($uuid = null, $start = null, $end = null, $direction = null) {
		extract($this->assign(["uuid" => &$uuid, "start" => &$start, "end" => &$end, "direction" => &$direction], true), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->add_link($uuid, $start, $end, $direction)));
	}
	
	function load($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->load_link($uuid)));
	}
	
	function save($uuid = null, $uuidNew = null, $start = null, $end = null, $direction = null) {
		extract($this->assign(["uuid" => &$uuid, "uuidNew" => &$uuidNew, "start" => &$start, "end" => &$end, "direction" => &$direction]), EXTR_OVERWRITE);
		return $this->is_successful(json_decode($GLOBALS["terminal"]->save_link($uuid, $uuidNew, $start, $end, $direction)));
	}
	
	function remove($uuid = null) {
		extract($this->assign(["uuid" => &$uuid]), EXTR_OVERWRITE);
		return $this->is_successful(json_encode($GLOBALS["terminal"]->remove_link($uuid)), true);
	}
}

?>