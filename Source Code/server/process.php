<?php

class _process {
	function __construct() {
		error_reporting(0);
		@ini_set('display_errors', 0);
		exec("START \"\" ..\index.html");
		$this->define_objects();
		$GLOBALS["server"]->listen([$this, "resolve"], [$this, "reject"]);
	}
	
	function define_objects() {
		$GLOBALS["process"] = $this;
		$GLOBALS["logger"] = new _logger();
		$GLOBALS["settings"] = new _settings();
		$GLOBALS["database"] = new _database();
		$GLOBALS["terminal"] = new _terminal();
		$GLOBALS["server"] = new _server("127.0.0.1", $GLOBALS["settings"]->server->port);
	}
	
	function resolve(_request $request) {
		$json = [];
		$json['$_GET'] = $request->get_array();
		$json['$_POST'] = $request->post_array();
		$json['$_FILES'] = $request->files_array();
		$json['$_COOKIE'] = $request->cookies_array();
		$json = $GLOBALS["terminal"]->convert_to_utf8($json);
		$return = $GLOBALS["terminal"]->execute($json);
		$GLOBALS["logger"]->trace("Request", $json, ["forceObject", "fallback", "jsonEncode"]);
		$GLOBALS["logger"]->trace("Response", json_decode($return), ["fallback", "jsonEncode"]);
		if (isset($_COOKIE["PHPSESSID"])) {
			return new _response(["body" => $return]);
		} else {
			return new _response(["body" => $return, "params" => ["PHPSESSID" => session_create_id()]]);
		}
	}
	
	function reject(_response $response) {
		$GLOBALS["logger"]->trace("Response", $response->get_body(), []);
	}
	
	function kill($wait = 0, $message = false) {
		if ($message) {
			$GLOBALS["logger"]->trace("Goodbye Message", $message, ["goodbye"]);
		}
		$GLOBALS["logger"]->countdown($wait);
		$GLOBALS["settings"]->lock_settings();
		exit();
	}
}

?>