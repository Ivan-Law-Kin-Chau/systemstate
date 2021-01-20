<?php

class _terminal extends _packaging {
	function execute($json) {
		try {
			$command = "";
			if (isset($json['$_FILES']["uploaded"])) {
				$command = 'upload($json[\'$_FILES\']["uploaded"]);';
			} else if (isset($json['$_POST']["query"])) {
				$command = urldecode($json['$_POST']["query"]);
			}
			return eval("return \$this->$command");
		} catch (Throwable $error) {
			return $GLOBALS["logger"]->syntax_error("PHP", $error->getMessage(), "command", $command);
		}
	}
	
	function convert_to_utf8($converted) {
		if (gettype($converted) == "array") {
			foreach ($converted as $key => $value) {
				$converted[$key] = $this->convert_to_utf8($value);
			}
		} else if (gettype($converted) == "string") {
			return utf8_encode($converted);
		}
		return $converted;
	}
}

?>