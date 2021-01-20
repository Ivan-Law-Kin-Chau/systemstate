<?php

class _multipart {
	private $body = null;
	private $boundary = null;
	private $newline = "\r\n";
	private $upload = [];
	private $post = [];
	
	function __construct($body, $boundary) {
		$this->boundary = $boundary;
		$this->body = explode($this->boundary, $body);
		unset($this->body[0]);
		$this->determine_newline_character($body);
		$this->parse();
	}
	
	function determine_newline_character($string) {
		$newline_strpos = strpos($string, "\n");
		if ($newline_strpos === false) {
			if (strpos($string, "\r") !== false) {
				$this->newline = "\r";
			} else {
				$this->newline = "\n";
			}
		} else if (str_split($string)[$newline_strpos - 1] === "\r") {
			$this->newline = "\r\n";
		} else {
			$this->newline = "\n";
		}
	}
	
	function parse() {
		$forms = [];
		foreach ($this->body as $part) {
			$form = [];
			// There is an artifact that looks like "\r\n\r\n--" at the end of each part, so let's remove it
			$part = substr($part, strlen($this->newline), strlen($part) - (strlen($this->newline.$this->newline) + 2));
			$part = explode($this->newline.$this->newline, $part);
			$parser = new _headers();
			$parsed = $parser->parse(explode($this->newline, $part[0]))["headers"];
			unset($part[0]);
			$part_body = implode($this->newline.$this->newline, $part);
			$part_headers = $this->parse_headers($parsed);
			$parsed = $part_headers["headers"];
			$form = $part_headers["content_disposition"];
			if ($part_body !== "") {
				$form["content"] = $part_body;
			}
			$forms[count($forms) - 1] = $form;
		}
		$this->submit_forms($forms);
	}
	
	function submit_forms($forms) {
		foreach ($forms as $form) {
			if ($form["name"] && $form["content"]) {
				if ($form["filename"]) {
					$this->upload[$form["name"]] = [];
					$this->upload[$form["name"]]["file_name"] = $form["filename"];
					$this->upload[$form["name"]]["file_content"] = $form["content"];
				} else {
					$this->post[$form["name"]] = $form["content"];
				}
			}
		}
	}
	
	function parse_headers($headers) {
		$content_disposition = false;
		foreach ($headers as $key => $value) {
			if ($key == "Content-Disposition") {
				$content_disposition = $this->parse_content_disposition($value);
			}
			if ($key == "Content-Type" && $value != "application/octet-stream") {
				$GLOBALS["logger"]->catch("Content types other than application/octet-stream are unsupported. ");
			}
		}
		return ["headers" => $headers, "content_disposition" => $content_disposition];
	}
	
	function parse_content_disposition($params_string) {
		$params = explode("; ", $params_string);
		if ($params[0] == "form-data") {
			$content_disposition = $this->content_disposition_params($params);
			if ($content_disposition["filename"] === null) {
				$GLOBALS["logger"]->catch("Content dispositions without a filename are unsupported. ");
			}
		} else {
			$GLOBALS["logger"]->catch("Content dispositions other than form-data are unsupported. ");
		}
		return $content_disposition;
	}
	
	function content_disposition_params($params) {
		$parsed = [];
		foreach ($params as $param) {
			// The first parameter is "form-data", which does not contain the character "=" and does not need to be parsed
			if (strpos($param, "=") !== false) {
				$param = explode("=", $param);
				$key = $param[0];
				unset($param[0]);
				$param = implode("=", $param);
				$value = $this->remove_quotation_marks($param);
				if ($key == "name" || $key == "filename") {
					$parsed[$key] = $value;
				} else {
					$parsed[$key] = $value;
				}
			}
		}
		return $parsed;
	}
	
	function remove_quotation_marks($quote) {
		if (substr($quote, 0, 1) == '"' && substr($quote, -1, 1) == '"') {
			$quote = substr($quote, 1, strlen($quote) - 2);
		}
		return $quote;
	}
	
	function get_upload() {
		return $this->upload;
	}
	
	function get_post() {
		return $this->post;
	}
}

?>