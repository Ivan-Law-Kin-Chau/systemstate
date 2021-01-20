<?php

class _return {
	private $uri = null;
	private $body = null;
	private $headers = [];
	private $results = [];
	private $mime_map = [
		"txt" => ["text/plain", "inline"], 
		"html" => ["text/html", "inline"], 
		"css" => ["text/css", "inline"], 
		"js" => ["text/javascript", "inline"], 
		"json" => ["text/json", "inline"], 
		"sql" => ["application/octet-stream", "attachment"], 
		"ico" => ["favicon/ico", "inline"]
	];
	
	function get_mime_type ($file_type) {
		return $this->mime_map[$file_type][0];
	}
	
	function get_content_disposition ($file_type) {
		return $this->mime_map[$file_type][1];
	}
	
	function execute ($uri = "/index.html") {
		$this->uri = $uri;
		$location = realpath(getcwd()."\\..".$this->uri);
		if ($location === false || is_dir($location)) {
			throw new Exception("File does not exist. ");
		}
		$this->body = file_get_contents($location);
		$file_type = pathinfo($location, PATHINFO_EXTENSION);
		$file_name = basename($location);
		$this->headers = [];
		$this->headers[count($this->headers)] = ["Content-Type", $this->get_mime_type($file_type)."; charset=utf-8"];
		$this->headers[count($this->headers)] = ["Content-Disposition", $this->get_content_disposition($file_type)."; filename=\"".$file_name."\""];
		$this->results = ["body" => $this->body, "headers" => $this->headers];
		return $this->results;
	}
}

?>