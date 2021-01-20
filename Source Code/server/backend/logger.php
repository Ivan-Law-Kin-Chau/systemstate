<?php

class _logger {
	private $errors = [];
	private $last_header = null;
	public $listening = true;
	
	function catch($error = false) {
		if ($error && gettype($error) == "string" && $this->listening == true) {
			$this->errors[count($this->errors)] = utf8_encode($error);
		}
	}
	
	function dump($value) {
		$this->catch(var_export($value, true));
	}
	
	function syntax_error($source, $error, $line_name, $line) {
		$this->catch("$source Error: $error");
		$output = new stdClass();
		$output->error = $error;
		$output->$line_name = $line;
		$output->success = false;
		$output->type = "$source Error";
		if ($this->beautify == true) {
			$output = json_encode($output, JSON_PRETTY_PRINT);
		} else {
			$output = json_encode($output);
		}
		return $output;
	}
	
	function release() {
		if (count($this->errors) > 0) {
			echo "Error(s)\r\n------------------------\r\n\r\n";
			foreach ($this->errors as $error) {
				echo $error."\r\n";
			}
			echo "\r\n\r\n\r\n\r\n";
			$this->errors = [];
		}
	}
	
	function repl() {
		if ($this->last_header != "Input Debug Command(s)") {
			$this->last_header = "Input Debug Command(s)";
			echo "Input Debug Command(s)\r\n------------------------\r\n\r\n";
		}
		echo "se > ";
		$command = fgets(fopen("php://stdin", "r"));
		$command = substr($command, 0, strlen($command) - 2);
		if ($command) {
			$this->eval_command("echo \$terminal->".$command, function($terminal_error) use($command) {
				$this->eval_command($command, function($general_error) use($command) {
					echo $general_error."\r\n";
				});
			});
		}
	}
	
	function eval_command($input, $callback) {
		try {
			$results = "";
			ob_start();
			foreach ($GLOBALS as $key => $value) {
				global $$key;
			}
			eval($input);
			$results = ob_get_contents();
			ob_end_clean();
			echo $results;
			if (strlen($results) > 0) {
				echo "\r\n";
			}
		} catch (Throwable $error) {
			ob_end_clean();
			call_user_func($callback, $error);
		}
	}
	
	function trace($head, $body, $array) {
		foreach ($array as $value) {
			$$value = true;
		}
		if ($this->last_header == "Input Debug Command(s)") {
			$this->last_header = $head;
			echo "\r\n\r\n\r\n\r\n";
		}
		if ($jsonEncode) {
			if ($forceObject) {
				if ($GLOBALS["settings"]->server->beautify_jsons == true) {
					$body = (string)json_encode($body, JSON_FORCE_OBJECT+JSON_PRETTY_PRINT);
				} else {
					$body = (string)json_encode($body, JSON_FORCE_OBJECT);
				}
			} else {
				if ($GLOBALS["settings"]->server->beautify_jsons == true) {
					$body = (string)json_encode($body, JSON_PRETTY_PRINT);
				} else {
					$body = (string)json_encode($body);
				}
			}
		}
		if ($goodbye) {
			$return = "$head\r\n------------------------\r\n\r\n$body\r\n";
		} else {
			$return = "$head\r\n------------------------\r\n\r\n$body\r\n\r\n\r\n\r\n\r\n";
		}
		if ($fallback) {
			if ($return === "$head\r\n------------------------\r\n\r\nnull\r\n\r\n\r\n\r\n\r\n") {
				return "$head\r\n------------------------\r\n\r\n<h1>Welcome to Systemstate Server</h1>\r\n\r\n\r\n\r\n\r\n";
			}
		}
		echo $return;
		if ($head == "Response") {
			$this->release();
		}
	}
	
	function countdown($wait) {
		for ($i = 0; $i < $wait; $i++) {
			echo "This process will automatically quit in ".($wait - $i)." second(s). \r\n";
			usleep(1000000);
		}
	}
}

?>