<?php

class _headers {
	private $check_for_multipart = null;
	
	function __construct($check_for_multipart = false) {
		// If check_for_multipart is set to true, parse the heads of HTTP requests and check whether the request body is in the multipart/form-data or not
		// If check_for_multipart is set to false, simply parse these key-value pairs which are the body of a multipart/form-data request
		$this->check_for_multipart = (bool)$check_for_multipart;
	}
	
	function parse($lines) {
		$headers = [];
		if ($this->check_for_multipart) {
			$multipart = false;
			$boundary = null;
		}
		foreach($lines as $line) {
			$line = trim($line);
			if (strpos($line, ": ") !== false) {
				$key = explode(": ", $line)[0];
				$value = explode(": ", $line)[1];
				$headers[$key] = $value;
				if ($this->check_for_multipart) {
					if ($key == "Content-Type" && explode("; ", $value)[0] == "multipart/form-data") {
						$multipart = true;
						$boundary = explode("--", explode("; ", $value)[1]);
						unset($boundary[0]);
						$boundary = "--".implode("--", $boundary);
					}
				}
			}
		}
		if ($this->check_for_multipart) {
			return ["headers" => $headers, "multipart" => $multipart, "boundary" => $boundary];
		} else {
			return ["headers" => $headers];
		}
	}
}

?>