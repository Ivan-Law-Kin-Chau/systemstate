<?php

class _packaging extends _assembly {
	function generate_uuid() {
		$range = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		$return = new stdClass();
		$return->_uuid = "";
		for ($i = 0; $i < 8; $i++) {
			$return->_uuid = $return->_uuid.$range[rand(0, strlen($range) - 1)];
		}
		if (json_decode($this->add_object($return->_uuid))->_success == true) {
			return json_encode($return);
		}
	}
	
	function iterative_search($iterateFunction, $condition, $uuid, $wildCard = false) {
		if ($wildCard == true && $uuid != "%") {
			$uuid = "%".$uuid."%";
		}
		$searchArrays = ["object_uuid", "group_uuid", "group_parent", "link_uuid", "link_start", "link_end", "property_uuid", "property_parent"];
		for ($searchArrayIndex = 0; $searchArrayIndex < count($searchArrays); $searchArrayIndex++) {
			$array = $searchArrays[$searchArrayIndex];
			$searchResult = json_decode($this->search(explode("_", $array)[1], $uuid, explode("_", $array)[0]))->_uuid;
			eval('if (' . $condition . ') {
				$output = true;
			} else {
				$output = false;
			}');
			if ($output === true) {
				$iterateFunction($searchResult, $array);
			}
		}
	}
	
	function expand($uuid) {
		$return = new stdClass();
		$this->iterative_search(function($searchResult, $array) use($return) {
			$return->$array = $searchResult;
		}, '$searchResult != null', $uuid, true);
		return json_encode($return);
	}
	
	function check($uuid) {
		$return = new stdClass();
		$this->iterative_search(function($searchResult, $array) use($return, $uuid) {
			$return->$array = array_values(json_decode(json_encode($searchResult), true));
			foreach ($return->$array as &$returnArrayElement) {
				if (explode("_", $array)[0] == "group") {
					unset($returnArrayElement[explode("_", $array)[1]]);
				}
				$returnArrayElement = array_values($returnArrayElement)[0];
			}
			unset($returnArrayElement);
			while (array_search($uuid, $return->$array) !== false) {
				unset($return->$array[array_search($uuid, $return->$array)]);
			}
			if (count($return->$array) == 0) {
				unset($return->$array);
			}
		}, '$searchResult != null', $uuid, "check");
		return json_encode($return);
	}
	
	function open($uuid) {
		if (json_decode($this->load_object($uuid))->_uuid == $uuid) {
			$return = new stdClass();
			$this->iterative_search(function($searchResult, $array) use($return) {
				for ($i = 0; $i < count($searchResult); $i++) {
					$uuidList = array_values(json_decode(json_encode($searchResult[$i]), true));
					$searchResult[$i] = false;
					$functionName = 'load_' . explode("_", $array)[0];
					$elementFromUuidList = json_decode(call_user_func_array([$this, $functionName], $uuidList));
					if ($elementFromUuidList != null && $elementFromUuidList->_success == true) {
						$elementFromUuidList->_dependencies = json_decode($this->check($elementFromUuidList->_uuid));
						$searchResult[$i] = $elementFromUuidList;
					}
				}
				$return->$array = $searchResult;
			}, '$searchResult != null && count($searchResult) != 0', $uuid, "open");
			return json_encode($return);
		} else {
			return false;
		}
	}
	
	function clear($strict = false) {
		if (unlink('../database/systemstate.db') || !(file_exists('../database/systemstate.db'))) {
			if ($strict == true) {
				$GLOBALS["database"] = new _database();
				$return = new stdClass();
				$return->_success = true;
				return json_encode($return);
			} else {
				if (json_decode($this->restore("init"))->_success == true) {
					$GLOBALS["database"] = new _database();
					$return = new stdClass();
					$return->_success = true;
					return json_encode($return);
				}
			}
		}
	}
	
	function undefine() {
		$return = new stdClass();
		$checked = json_decode(json_encode(json_decode($this->search("uuid", "%", "object"))->_uuid), true);
		for ($i = 0; $i < count($checked); $i++) {
			$GLOBALS["logger"]->listening = false;
			$this->query("DELETE FROM `object` WHERE uuid = '".$checked[$i]["uuid"]."';");
			$GLOBALS["logger"]->listening = true;
		}
		$return->_success = true;
		return json_encode($return);
	}
	
	function import($filename, $passcode = null) {
		if (!(isset($passcode))) {
			return $this->restore($filename);
		} else {
			$input = file_get_contents('../database/'.$filename.'.json');
			$input = json_decode($input);
			$salt = $input->_salt;
			$token = $input->_token;
			$method = "aes-128-ctr";
			$key = openssl_digest($passcode, "SHA256", TRUE);
			$sql = openssl_decrypt($token, $method, $key, 0, base64_decode($salt));
			$suffix = json_decode($this->generate_uuid())->_uuid;
			file_put_contents('../database/'.$filename.'_'.$suffix.'.sql', $sql);
			if (json_decode($this->restore($filename.'_'.$suffix))->_success == true) {
				unlink('../database/'.$filename.'_'.$suffix.'.sql');
				$return = new stdClass();
				$return->_filename = $filename.".json";
				$return->_encrypted = true;
				$return->_password = $passcode;
				$return->_success = true;
				$return->_type = "import";
				return json_encode($return);
			}
		}
	}
	
	function export($filename, $passcode = null) {
		if (!(isset($passcode))) {
			return $this->backup($filename);
		} else {
			$suffix = json_decode($this->generate_uuid())->_uuid;
			if (json_decode($this->backup($filename.'_'.$suffix))->_success == true) {
				$sql = file_get_contents('../database/'.$filename.'_'.$suffix.'.sql');
				unlink('../database/'.$filename.'_'.$suffix.'.sql');
				$method = "aes-128-ctr";
				$key = openssl_digest($passcode, "SHA256", TRUE);
				$salt = openssl_random_pseudo_bytes(openssl_cipher_iv_length($method));
				$output = new stdClass();
				$output->_salt = str_replace("=", "", base64_encode($salt));
				$output->_token = str_replace("=", "", openssl_encrypt($sql, $method, $key, 0, $salt));
				file_put_contents('../database/'.$filename.".json", json_encode($output, JSON_PRETTY_PRINT));
				$return = new stdClass();
				$return->_filename = $filename.".json";
				$return->_encrypted = true;
				$return->_password = $passcode;
				$return->_success = true;
				$return->_type = "export";
				return json_encode($return);
			}
		}
	}
	
	function upload($upload) {
		if (json_decode($this->clear(true))->_success == true) {
			$file_uploaded = fopen('../database/'.$upload["file_name"], "w+");
			$file_written = fwrite($file_uploaded, $upload["file_content"]) || false;
			fclose($file_uploaded);
		}
		if ($file_written) {
			$return = new stdClass();
			$return->_type = "upload";
			$return->_success = true;
			$restoreFile = explode(".", $upload["file_name"]);
			unset($restoreFile[count($restoreFile) - 1]);
			$restoreFile = implode(".", $restoreFile);
			if (json_decode($this->restore($restoreFile))->_success == true) {
				return json_encode($return);
			}
		}
	}
	
	function script($script) {
		eval(urldecode($script));
		$return = new stdClass();
		$return->_type = "script";
		$return->_success = true;
		return json_encode($return);
	}
	
	function terminate() {
		$GLOBALS["process"]->kill();
	}
}

?>