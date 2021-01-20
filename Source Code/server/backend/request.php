<?php

class _request {
	private $method = null;
	private $uri = null;
	private $headers = [];
	private $get = [];
	private $post = [];
	private $multipart = null;
	private $boundary = null;
	private $upload = [];
	
	function __construct($request_string) {
		$request_string = explode("\r\n\r\n", $request_string);
		$request_head = $request_string[0];
		unset($request_string[0]);
		$lines = explode("\r\n", $request_head);
		$parser = new _headers(true);
		$parsed = $parser->parse($lines);
		$this->multipart = $parsed["multipart"];
		$this->boundary = $parsed["boundary"];
		$this->headers = $parsed["headers"];
		$this->parse_first_line($lines[0]);
		if (count($request_string) > 0) {
			$this->parse($request_string);
		}
	}
	
	function parse_first_line($first_line) {
		$method = explode(" ", $first_line)[0];
		$this->method = strtoupper($method);
		if (array_key_exists(1, explode(" ", $first_line))) {
			$uri = explode(" ", $first_line)[1];
		} else {
			$uri = "";
		}
		$this->uri = explode("?", $uri)[0];
		if (isset(explode("?", $uri)[1])) {
			parse_str(explode("?", $uri)[1], $this->get);
		}
	}
	
	function parse($body) {
		if ($this->multipart == true) {
			$request_body = implode("\r\n\r\n", $body);
			$multipart = new _multipart($request_body, $this->boundary);
			$this->upload = $multipart->get_upload();
			$this->post = $multipart->get_post();
		} else {
			$request_body = implode("", $body);
			parse_str($request_body, $this->post);
		}
	}
	
	function get_method() {
		return $this->method;
	}
	
	function get_uri() {
		return $this->uri;
	}
	
	function get_header($key, $default = null) {
		if (!isset($this->headers[$key])) {
			return $default;
		}
		return $this->headers[$key];
	}
	
	function get_array() {
		return (array)$this->get;
	}
	
	function post_array() {
		return (array)$this->post;
	}
	
	function files_array() {
		return (array)$this->upload;
	}
	
	function cookies_array() {
		parse_str($this->get_header("Cookie"), $cookies);
		return (array)$cookies;
	}
}

?>