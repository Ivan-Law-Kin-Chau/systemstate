<?php

class _settings {
	private $argc = null;
	private $argv = null;
	
	function __construct() {
		$this->argc = $GLOBALS["argc"];
		$this->argv = $GLOBALS["argv"];
		$GLOBALS["argc"] = 0;
		$GLOBALS["argv"] = [];
		$this->lock = fopen("../resources/settings.json", "c+");
		$settings = fread($this->lock, filesize("../resources/settings.json"));
		// Lock the settings so that no one can change the port setting from settings.json and start a second instance of the Systemstate Server
		$this->lock_settings();
		foreach (json_decode($settings) as $key => $value) {
			$this->$key = $value;
		}
		foreach ($this->argv as $key => $value) {
			if ($key != 0) {
				if (explode("=", $value)[0] == "--debug") {
					$this->server->debug = true;
				}
				if (explode("=", $value)[0] == "--beautify-jsons") {
					$this->server->beautify_jsons = true;
				}
				if (explode("=", $value)[0] == "--stream-capacity") {
					$stream_capacity = explode("=", $value);
					unset($stream_capacity[0]);
					$stream_capacity = implode("=", $stream_capacity);
					$this->server->stream_capacity = (int)$stream_capacity;
				}
			}
		}
		if (isset($this->server->debug)) {
			$this->server->debug = (bool)$this->server->debug;
		} else {
			$this->server->debug = false;
		}
		if (isset($this->server->beautify_jsons)) {
			$this->server->beautify_jsons = (bool)$this->server->beautify_jsons;
		} else {
			$this->server->beautify_jsons = false;
		}
	}
	
	function argc() {
		$count = $this->argc - 1;
		return $count;
	}
	
	function argv($delimit = false) {
		$list = "[";
		$delete_last_comma = false;
		foreach ($this->argv as $key => $value) {
			if ($key != 0) {
				if ($delimit) {
					$list .= "\"".implode("\\\"", explode("\"", $value))."\", ";
				} else {
					$list .= "\"".$value."\", ";
				}
				$delete_last_comma = true;
			}
		}
		if ($delete_last_comma) {
			$list = substr($list, 0, strlen($list) - 2);
		}
		$list .= "]";
		return $list;
	}
	
	function lock_settings() {
		if(!(flock($this->lock, LOCK_SH | LOCK_NB))) {
			$GLOBALS["process"]->kill(12, "Another instance of the Systemstate Server is already running. ");
		}
	}
	
	function unlock_settings() {
		if (isset($this->lock) == true) {
			flock($this->lock, LOCK_UN | LOCK_NB);
			fclose($this->lock);
		}
	}
}

?>