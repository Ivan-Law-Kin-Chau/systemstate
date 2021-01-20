<?php

class _process {
	function __construct() {
		error_reporting(0);
		@ini_set('display_errors', 0);
		$this->define_objects();
		$GLOBALS["server"]->listen([$this, "resolve"], [$this, "reject"]);
	}
	
	function launch_browser() {
		exec("START \"\" http://localhost:".$GLOBALS["settings"]->server->port."/index.html");
	}
	
	function define_objects() {
		$GLOBALS["process"] = $this;
		$GLOBALS["return"] = new _return;
		$GLOBALS["logger"] = new _logger();
		$GLOBALS["settings"] = new _settings();
		$GLOBALS["database"] = new _database();
		$GLOBALS["terminal"] = new _terminal();
		$GLOBALS["server"] = new _server("localhost", $GLOBALS["settings"]->server->port);
	}
	
	function resolve(_request $request) {
		if ($request->get_uri() === "/terminal") {
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
		} else {
			try {
				$return = $GLOBALS["return"]->execute($request->get_uri());
				$response = new _response(["body" => $return["body"]]);
				foreach ($return["headers"] as $value) {
					$response->set_header($value[0], $value[1], true);
				}
			} catch (Exception $exception) {
				if ($exception->getMessage() === "File does not exist. ") {
					$response = new _response(["status" => 404, "error" => true]);
				}
			}
			return $response;
		}
	}
	
	function reject(_response $response) {
		$GLOBALS["logger"]->trace("Response", $response->get_body(), []);
	}
	
	function kill($wait = 0, $message = false, $delete_call = true) {
		if ($message) {
			$GLOBALS["logger"]->trace("Goodbye Message", $message, ["goodbye"]);
		}
		$GLOBALS["logger"]->countdown($wait);
		$GLOBALS["settings"]->unlock_settings();
		if ($delete_call === true) {
			unlink(getcwd()."\\..\\resources\\call");
		}
		exit();
	}
}

?>