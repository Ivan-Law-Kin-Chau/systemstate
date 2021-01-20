<?php

class _server {
	private $host = null;
	private $port = null;
	private $socket = null;
	
	function __construct($host, $port) {
		$this->host = $host;
		$this->port = (int)$port;
		$this->socket = socket_create(AF_INET, SOCK_STREAM, 0);
		socket_set_nonblock($this->socket);
		if (socket_bind($this->socket, $this->host, $this->port)) {
			$GLOBALS["logger"]->trace("Welcome Message", "Systemstate Server received ".$GLOBALS["settings"]->argc()." argument(s): ".$GLOBALS["settings"]->argv()."\r\nSystemstate Server is now listening at port ".$this->port.". ", []);
		} else {
			$error = socket_strerror(socket_last_error());
			$GLOBALS["logger"]->catch("Could not bind ".$this->host." to port ".$this->port.": ".$error);
			$GLOBALS["process"]->kill(3, "Another instance of Systemstate Server is already running. ");
		}
	}
	
	function listen($callback_function, $error_handler = null) {
		if (!(is_callable($callback_function))) {
			$GLOBALS["logger"]->catch("A callback function is required. ");
			$GLOBALS["process"]->kill();
		}
		$GLOBALS["logger"]->release();
		while (true) {
			if ($GLOBALS["settings"]->server->debug == true) {
				$GLOBALS["logger"]->repl();
			}
			socket_listen($this->socket);
			if (!($client = socket_accept($this->socket))) {
				socket_close($client);
			} else {
				$request = new _request(socket_read($client, $GLOBALS["settings"]->server->stream_capacity));
				$response = call_user_func($callback_function, $request);
				if (!($response)) {
					$response = new _response(["status" => 404, "error" => true]);
					if ($error_handler) {
						call_user_func($error_handler, $response);
					}
				}
				$response = (string)$response;
				socket_write($client, $response, strlen($response));
				socket_close($client);
			}
		}
	}
}

?>