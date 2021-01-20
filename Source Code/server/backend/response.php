<?php

class _response {
	private $statusCodes = [
		100 => "Continue", 
		101 => "Switching Protocols", 
		200 => "OK", 
		201 => "Created", 
		202 => "Accepted", 
		203 => "Non-Authoritative Information", 
		204 => "No Content", 
		205 => "Reset Content", 
		206 => "Partial Content", 
		300 => "Multiple Choices", 
		301 => "Moved Permanently", 
		302 => "Found", 
		303 => "See Other", 
		304 => "Not Modified", 
		305 => "Use Proxy", 
		307 => "Temporary Redirect", 
		400 => "Bad Request", 
		401 => "Unauthorized", 
		402 => "Payment Required", 
		403 => "Forbidden", 
		404 => "Not Found", 
		405 => "Method Not Allowed", 
		406 => "Not Acceptable", 
		407 => "Proxy Authentication Required", 
		408 => "Request Timeout", 
		409 => "Conflict", 
		410 => "Gone", 
		411 => "Length Required", 
		412 => "Precondition Failed", 
		413 => "Request Entity Too Large", 
		414 => "Request-URI Too Long", 
		415 => "Unsupported Media Type", 
		416 => "Requested Range Not Satisfiable", 
		417 => "Expectation Failed", 
		500 => "Internal Server Error", 
		501 => "Not Implemented", 
		502 => "Bad Gateway", 
		503 => "Service Unavailable", 
		504 => "Gateway Timeout", 
		505 => "HTTP Version Not Supported", 
		509 => "Bandwidth Limit Exceeded"
	];
	private $status = 200;
	private $body = "";
	private $headers = [];
	
	function __construct($array) {
		if (array_key_exists("body", $array)) {
			$body = (string)$array["body"];
		} else {
			$body = "";
		}
		if (array_key_exists("status", $array)) {
			$status = (int)$array["status"];
		} else {
			$status = null;
		}
		if (array_key_exists("error", $array)) {
			$error = (bool)$array["error"];
		} else {
			$error = false;
		}
		if (array_key_exists("params", $array)) {
			$params = (array)$array["params"];
		} else {
			$params = null;
		}
		if ($error == true) {
			$body = "<h1>Systemstate Server: ".$status." - ".$this->statusCodes[$status]."</h1>";
		}
		if (isset($status) == true) {
			if ($status !== null) {
				$this->status = $status;
			}
		}
		$this->body = $body;
		$this->set_header("Date", date("D, d M Y H:i:s T"));
		$this->set_header("Content-Type", "text/html; charset=utf-8");
		$this->set_header("Access-Control-Allow-Origin", "*");
		$this->set_header("Server", "Systemstate Server");
		if ($params !== null) {
			$this->set_header("Set-Cookie", urldecode(http_build_query($params)));
		}
	}
	
	function __toString() {
		return $this->get_header_string().$this->get_body();
	}
	
	function set_header($key, $value, $move_to_end = false) {
		$buffer = str_split($key);
		unset($buffer[0]);
		$key = strtoupper($key[0]).implode("", $buffer);
		if (isset($this->headers[$key]) && $move_to_end === true) {
			unset($this->headers[$key]);
		}
		$this->headers[$key] = $value;
	}
	
	function get_header_string() {
		$lines = [];
		$lines[count($lines)] = "HTTP/1.1 ".$this->status." ".$this->statusCodes[$this->status];
		foreach($this->headers as $key => $value) {
			$lines[count($lines)] = $key.": ".$value;
		}
		return implode(" \r\n", $lines)."\r\n\r\n";
	}
	
	function get_body()	{
		return $this->body;
	}
}

?>