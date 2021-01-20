<?php

class _database {
	private $schema = ["object" => ["uuid"], "group" => ["uuid", "parent"], "link" => ["uuid", "start", "end", "direction"], "property" => ["uuid", "parent", "name", "content"]];
	private $input_pipes = [["pipe", "r"], ["pipe", "w"], ["pipe", "w"]];
	private $output_pipes = null;
	private $current_working_directory = null;
	private $init_command = "sqlite3 systemstate.db";
	private $database = null;
	private $query = null;
	private $buffer_array = [];
	private $error_array = [];
	
	function listen() {
		if (is_resource($this->database)) {
			$result = fread($this->output_pipes[1], $GLOBALS["settings"]->server->stream_capacity);
			if ($result) {
				$this->buffer_array[count($this->buffer_array)] = $result;
			}
			$error = fread($this->output_pipes[2], $GLOBALS["settings"]->server->stream_capacity);
			if ($error) {
				$this->error_array[count($this->error_array)] = $error;
			}
			if (feof($this->output_pipes[1]) && feof($this->output_pipes[2])) {
				return $this->output();
			}
		}
	}
	
	function output() {
		$results = implode("\r\n", $this->buffer_array);
		if (!($results)) {
			$results = "";
		}
		$array = $this->csv_to_array($results);
		$errors = implode("\r\n", $this->error_array);
		if ($errors) {
			$success = false;
			$output = $this->handle_errors($errors);
		} else {
			$success = true;
			if ($this->query->get_queryType() == true) {
				$output = $this->query->database_callback($success, $array);
			} else {
				$output = $this->query->database_callback($success);
			}
		}
		$this->buffer_array = [];
		$this->error_array = [];
		$this->unbind();
		return $output;
	}
	
	function csv_to_array($results) {
		$memory = fopen("php://memory", "a+");
		fwrite($memory, $results, strlen($results));
		rewind($memory);
		$array = [];
		$schema = [];
		while (true) {
			$data = fgetcsv($memory);
			if ($data !== false) {
				// Map the $row names into the array indexes starting from the second row
				// The first row only stores the column names
				if ($schema !== []) {
					$array[count($array)] = [];
				}
				// Load the column names from the first row of the CSV
				if ($schema === []) {
					foreach ($data as $value) {
						$schema[count($schema)] = $value;
					}
				} else {
					foreach ($data as $key => $value) {
						$array[count($array) - 1][$schema[$key]] = $value;
					}
				}
			} else {
				// The CSV has ended
				break;
			}
		}
		fclose($memory);
		return $array;
	}
	
	function handle_errors($errors) {
		$errors = explode("Error: ", $errors);
		unset($errors[0]);
		$errors = implode("\r\n", $errors);
		$errors = explode("\r\n", $errors);
		unset($errors[count($errors) - 1]);
		$errors = implode("\r\n", $errors);
		return $GLOBALS["logger"]->syntax_error("SQLite3", $errors, "sql", $this->query->sql);
	}
	
	function query(_query $query) {
		$this->query = $query;
		$this->current_working_directory = getcwd();
		chdir("../database");
		$this->database = proc_open($this->init_command, $this->input_pipes, $this->output_pipes);
		chdir($this->current_working_directory);
		stream_set_blocking($this->output_pipes[0], 0);
		stream_set_blocking($this->output_pipes[1], 0);
		$query = ".headers on\r\n.mode csv\r\nPRAGMA foreign_keys = ON;\r\n".$this->query->sql."\r\n";
		fwrite($this->output_pipes[0], $query, strlen($query));
		fclose($this->output_pipes[0]);
		while (true) {
			$output = $this->listen();
			if ($output) {
				return $output;
			}
		}
	}
	
	function unbind() {
		fclose($this->output_pipes[1]);
		fclose($this->output_pipes[2]);
		proc_close($this->database);
	}
	
	function get_schema() {
		return $this->schema;
	}
}

?>