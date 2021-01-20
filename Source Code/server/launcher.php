<?php

chdir("server");

require_once "backend/logger.php";
require_once "backend/settings.php";
require_once "backend/header.php";
require_once "backend/multipart.php";
require_once "backend/server.php";
require_once "backend/request.php";
require_once "backend/response.php";
require_once "backend/database.php";
require_once "backend/query.php";

require_once "terminal/classes/key.php";
require_once "terminal/classes/direction.php";
require_once "terminal/classes/varchar.php";
require_once "terminal/classes/validation.php";
require_once "terminal/classes/element.php";
require_once "terminal/classes/object.php";
require_once "terminal/classes/group.php";
require_once "terminal/classes/link.php";
require_once "terminal/classes/property.php";

require_once "terminal/assembly.php";
require_once "terminal/packaging.php";
require_once "terminal/terminal.php";

require_once "process.php";
require_once "return.php";

$process = new _process();

?>