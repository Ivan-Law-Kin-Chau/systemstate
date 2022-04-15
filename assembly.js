module.exports = class Assembly {
	constructor (database) {
		this.database = database;
	}
	
	convert_boolean_to_sql (input) {
		if (input === null) {
			return "null";
		} else if (input === true) {
			return "true";
		} else if (input === false) {
			return "false";
		} else {
			throw "Conversion error: " + input;
		}
	}
	
	convert_sql_to_boolean (input) {
		if (input === null) {
			return null;
		} else if (input === 1) {
			return true;
		} else if (input === 0) {
			return false;
		} else {
			throw "Conversion error: " + input;
		}
	}
	
	async execute (command) {
		console.log(command);
		return eval("(this." + command + ")");
	}
	
	async query (sql, callback) {
		var database = this.database;
		return new Promise ((resolve, reject) => {
			database.all(sql, (error, rows) => {
				if (error) {
					resolve(JSON.stringify({
						_success: false, 
						_type: "SQL Error", 
						_sql: sql, 
						_error: error.code
					}));
				} else {
					callback(rows, resolve);
				}
			});
		});
	}
	
	async add_object (uuid) {
		var type = "object";
		var sql = "INSERT INTO `" + type + "` VALUES (\'" + uuid + "\');";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async load_object (uuid) {
		var type = "object";
		var sql = "SELECT * FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async save_object (uuid, uuidNew) {
		var type = "object";
		var sql = "UPDATE `" + type + "` SET uuid = \'" + uuidNew + "\' WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async remove_object (uuid) {
		var type = "object";
		var sql = "DELETE FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async add_group (uuid, parent) {
		var type = "group";
		var sql = "INSERT INTO `" + type + "` VALUES (\'" + uuid + "\', \'" + parent + "\');";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async load_group (uuid, parent) {
		var type = "group";
		var sql = "SELECT * FROM `" + type + "` WHERE uuid = \'" + uuid + "\' AND parent = \'" + parent + "\';";
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var parent = row["parent"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async save_group (uuid, uuidNew, parent, parentNew) {
		var type = "group";
		var sql = "UPDATE `" + type + "` SET uuid = \'" + uuidNew + "\', parent = \'" + parentNew + "\' WHERE uuid = \'" + uuid + "\' AND parent = \'" + parent + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_parent: parentNew, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async remove_group (uuid, parent) {
		var type = "group";
		var sql = "DELETE FROM `" + type + "` WHERE uuid = \'" + uuid + "\' AND parent = \'" + parent + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async add_link (uuid, start, end, direction = null) {
		var type = "link";
		var sql = "INSERT INTO `" + type + "` VALUES (\'" + uuid + "\', \'" + start + "\', \'" + end + "\', " + this.convert_boolean_to_sql(direction) + ");";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_start: start, 
				_end: end, 
				_direction: direction, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async load_link (uuid) {
		var type = "link";
		var sql = "SELECT * FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var start = row["start"];
				var end = row["end"];
				var direction = row["direction"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_start: start, 
				_end: end, 
				_direction: this.convert_sql_to_boolean(direction), 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async save_link (uuid, uuidNew, start, end, direction = null) {
		var type = "link";
		var sql = "UPDATE `" + type + "` SET uuid = \'" + uuidNew + "\', start = \'" + start + "\', end = \'" + end + "\', direction = " + this.convert_boolean_to_sql(direction) + " WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuidNew, 
				_start: start, 
				_end: end, 
				_direction: direction, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async remove_link (uuid) {
		var type = "link";
		var sql = "DELETE FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async add_property (uuid, parent, name, content) {
		var type = "property";
		var sql = "INSERT INTO `" + type + "` VALUES (\'" + uuid + "\', \'" + parent + "\', \'" + name + "\', \'" + content + "\');";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async load_property (uuid) {
		var type = "property";
		var sql = "SELECT * FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			if (rows.length === 0) {
				resolve(JSON.stringify({
					_success: false, 
					_type: "Systemstate Error", 
					_sql: sql, 
					_error: "Not found"
				}));
				return;
			}
			
			for (const row of rows) {
				var uuid = row["uuid"];
				var parent = row["parent"];
				var name = row["name"];
				var content = row["content"];
			}
			
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async save_property (uuid, uuidNew, parent, name, content) {
		var type = "property";
		var sql = "UPDATE `" + type + "` SET uuid = \'" + uuidNew + "\', parent = \'" + parent + "\', name = \'" + name + "\', content = \'" + content + "\' WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_parent: parent, 
				_name: name, 
				_content: content, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	async remove_property (uuid) {
		var type = "property";
		var sql = "DELETE FROM `" + type + "` WHERE uuid = \'" + uuid + "\';";
		return this.query(sql, (rows, resolve) => {
			resolve(JSON.stringify({
				_uuid: uuid, 
				_success: true, 
				_type: type, 
				_sql: sql
			}));
		});
	}
	
	
	async search (property, content, type = "object", descriptive = null) {
		var type = type;
		
		if (descriptive === true) {
			var sql = "SELECT DISTINCT t1.parent, t2.content FROM `property` t1 JOIN `property` t2 ON t1.parent = t2.parent WHERE t1.content LIKE \'" + content + "\' ORDER BY t1.parent, t2.name ASC;";
		} else {
			if (type === "group") {
				var sql = "SELECT uuid, parent FROM `" + type + "` WHERE " + property + " LIKE \'" + content + "\';";
			} else {
				var sql = "SELECT uuid FROM `" + type + "` WHERE " + property + " LIKE \'" + content + "\';";
			}
		}
		
		return this.query(sql, (rows, resolve) => {
			for (const row of rows) {
				if (descriptive === true) {
					if (typeof output === "undefined") {
						var output = [];
						var parent = "";
					}
					
					if (parent !== row["parent"]) {
						parent = row["parent"];
						output[output.length] = [row["parent"], row["content"]];
					} else {
						output[output.length] = [row["content"]];
					}
				} else {
					if (typeof output === "undefined") {
						var output = [];
					}
					
					output[output.length] = {};
					for (var rowProperty in row) {
						var rowContent = row[rowProperty];
						output[output.length - 1][rowProperty] = rowContent;
					}
				}
			}
			
			if (typeof output === "undefined") {
				var output = [];
			}
			
			resolve(JSON.stringify({
				_uuid: output, 
				_success: true, 
				_type: "search", 
				_sql: sql
			}));
		});
	}
}